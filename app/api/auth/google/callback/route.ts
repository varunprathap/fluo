import { NextRequest, NextResponse } from 'next/server';
import { googleAuthConfig } from '@/config/googleAuthConfig';
import { googleClientId, googleClientSecret } from '@/amplify/auth/secrets';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL || !googleClientId || !googleClientSecret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
    const redirectUri = `${siteUrl}${googleAuthConfig.redirectUri}`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId.toString(),
        client_secret: googleClientSecret.toString(),
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        access_type: "offline",
      }).toString()
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return NextResponse.json({ 
        error: tokenData.error_description || 'Failed to exchange code for tokens',
        details: tokenData.error
      }, { status: 500 });
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Store tokens in DynamoDB
    const storeRes = await fetch(`${siteUrl}/api/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        access_token,
        refresh_token,
        expires_in,
        scope: searchParams.get('scope')
      })
    });

    if (!storeRes.ok) {
      return NextResponse.json({ error: 'Failed to store tokens' }, { status: 500 });
    }

    // Redirect back to the apps page with success parameter
    return NextResponse.redirect(`${siteUrl}/admin/dash/apps?auth_status=success`);
  } catch (error: any) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/dash/apps?auth_status=error&message=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
} 