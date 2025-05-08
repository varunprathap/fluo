import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit');
  const similarity_threshold = searchParams.get('similarity_threshold');

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Build query string
  const params = new URLSearchParams({ query });
  if (limit) params.append('limit', String(limit));
  if (similarity_threshold) params.append('similarity_threshold', String(similarity_threshold));

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    // Call the external ask_synapse API
    const response = await fetch(
      `${baseUrl}/ask_synapse?${params.toString()}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Ask Synapse API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 