import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/recent`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching recent queries:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 