import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
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
      return res.status(500).json({ 
        error: tokenData.error_description || 'Failed to refresh token',
        details: tokenData.error
      });
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
    const storeRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/tokens`, {
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

    return res.status(200).json({
      access_token: tokenData.access_token,
      userInfo
    });
  } catch (error) {
    console.error('[Google OAuth] Refresh error:', error);
    return res.status(500).json({ 
      error: 'Failed to refresh token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 