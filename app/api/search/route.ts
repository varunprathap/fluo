import { NextRequest, NextResponse } from 'next/server';

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

const validateEnv = () => {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new SearchAPIError(
      'Search API URL not configured',
      500,
      'NEXT_PUBLIC_API_BASE_URL is not set in environment variables'
    );
  }
};

export async function GET(req: NextRequest) {
  try {
    validateEnv();
    const { searchParams } = new URL(req.url!);
    const query = searchParams.get('query') || '';
    const limit = searchParams.get('limit') || '10';

    if (typeof query !== 'string') {
      throw new SearchAPIError(
        'Invalid query parameter',
        400,
        'Query parameter must be a string'
      );
    }

    const searchUrl = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search`);
    searchUrl.searchParams.append('query', query);
    searchUrl.searchParams.append('limit', limit.toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new SearchAPIError(
        'Search API request failed',
        response.status,
        errorData || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new SearchAPIError(
        'Invalid response format',
        500,
        'Search API returned invalid data format'
      );
    }
    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof SearchAPIError) {
      console.error('Search API Error:', {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details
      });
      return NextResponse.json({
        error: error.message,
        details: error.details
      }, { status: error.statusCode });
    }
    if (error.name === 'AbortError') {
      console.error('Search API timeout');
      return NextResponse.json({
        error: 'Request timeout',
        message: 'The search request took too long to complete'
      }, { status: 504 });
    }
    if (error.message && error.message.includes('fetch failed')) {
      console.error('Network error:', error);
      return NextResponse.json({
        error: 'Service unavailable',
        message: 'Unable to connect to the search service'
      }, { status: 503 });
    }
    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
} 