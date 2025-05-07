import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // TODO: Implement actual ask functionality
    // This is a placeholder response
    const response = {
      answer: `This is a placeholder response for the query: "${query}"`,
      sources: [
        {
          title: 'Example Source 1',
          type: 'document',
          url: '#'
        },
        {
          title: 'Example Source 2',
          type: 'spreadsheet',
          url: '#'
        }
      ]
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Ask API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 