import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const query = searchParams.get('query');

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Call the external ask API
    const response = await fetch(
      `http://localhost:8000/ask?query=${encodeURIComponent(query)}&limit=10&similarity_threshold=0.8`,
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
    console.error('Ask API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 