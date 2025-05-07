import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/recent`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recent queries:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 