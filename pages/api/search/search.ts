import type { NextApiRequest, NextApiResponse } from 'next';

// Custom error class for API errors
class SearchAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'SearchAPIError';
  }
}

// Validate environment variables
const validateEnv = () => {
  if (!process.env.NEXT_PUBLIC_SEARCH_API_URL) {
    throw new SearchAPIError(
      'Search API URL not configured',
      500,
      'NEXT_PUBLIC_SEARCH_API_URL is not set in environment variables'
    );
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate request method
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    // Validate environment variables
    validateEnv();

    const { query = '', page = '1', limit = '10' } = req.query;

    // Validate query parameters
    if (typeof query !== 'string') {
      throw new SearchAPIError(
        'Invalid query parameter',
        400,
        'Query parameter must be a string'
      );
    }

    // Construct the search URL
    const searchUrl = new URL(`${process.env.NEXT_PUBLIC_SEARCH_API_URL}/search`);
    searchUrl.searchParams.append('query', query);
    searchUrl.searchParams.append('limit', limit.toString());

    // Make the API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new SearchAPIError(
        'Search API request failed',
        response.status,
        errorData || `HTTP error! status: ${response.status}`
      );
    }

    // Parse and validate response
    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new SearchAPIError(
        'Invalid response format',
        500,
        'Search API returned invalid data format'
      );
    }

    // Return successful response
    return res.status(200).json(data);

  } catch (error) {
    // Handle different types of errors
    if (error instanceof SearchAPIError) {
      console.error('Search API Error:', {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details
      });
      return res.status(error.statusCode).json({
        error: error.message,
        details: error.details
      });
    }

    if (error instanceof Error) {
      // Handle fetch-specific errors
      if (error.name === 'AbortError') {
        console.error('Search API timeout');
        return res.status(504).json({
          error: 'Request timeout',
          message: 'The search request took too long to complete'
        });
      }

      // Handle network errors
      if (error.message.includes('fetch failed')) {
        console.error('Network error:', error);
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Unable to connect to the search service'
        });
      }
    }

    // Handle unknown errors
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}