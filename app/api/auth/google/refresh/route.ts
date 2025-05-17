import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { refresh_token } = body;

  if (!refresh_token) {
    return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
  }

  try {
    // Exchange refresh token for new access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token,
        grant_type: "refresh_token"
      }).toString()
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('[Google OAuth] Token refresh error:', tokenData);
      return NextResponse.json({ 
        error: tokenData.error_description || 'Failed to refresh token',
        details: tokenData.error
      }, { status: 500 });
    }

    // Get user info with the new token
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoRes.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoRes.json();

    // Update the token in DynamoDB
    const storeRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token, // Keep the same refresh token
        expires_in: tokenData.expires_in
      })
    });

    if (!storeRes.ok) {
      throw new Error('Failed to store refreshed token');
    }

    return NextResponse.json({
      access_token: tokenData.access_token,
      userInfo
    });
  } catch (error: any) {
    console.error('[Google OAuth] Refresh error:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh token',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 