import { NextApiRequest, NextApiResponse } from 'next';
import { googleAuthConfig } from '@/config/googleAuthConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const { code, state } = req.query;
  console.log('[Google OAuth] Callback received with params:', { code, state });

  if (!code || typeof code !== 'string') {
    console.error('[Google OAuth] Missing or invalid authorization code');
    return res.status(400).json({ error: "Missing authorization code" });
  }

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.error('[Google OAuth] NEXT_PUBLIC_SITE_URL is not set');
    return res.status(500).json({ error: "Server configuration error: Site URL not set" });
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    console.error('[Google OAuth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
    return res.status(500).json({ error: "Server configuration error: Client ID not set" });
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error('[Google OAuth] GOOGLE_CLIENT_SECRET is not set');
    return res.status(500).json({ error: "Server configuration error: Client secret not set" });
  }

  try {
    // Construct redirect URI
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''); // Remove trailing slash if present
    const redirectUri = `${siteUrl}${googleAuthConfig.redirectUri}`;
    
    console.log('[Google OAuth] Using redirect URI:', redirectUri);
    console.log('[Google OAuth] Environment variables:', {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'present' : 'missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'present' : 'missing'
    });

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        access_type: "offline",
      }).toString()
    });

    const tokenData = await tokenRes.json();
    console.log('[Google OAuth] Token exchange response:', {
      status: tokenRes.status,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      error: tokenData.error
    });

    if (tokenData.error) {
      console.error('[Google OAuth] Token exchange error:', tokenData);
      return res.status(500).json({ 
        error: tokenData.error_description || 'Failed to exchange code for tokens',
        details: tokenData.error
      });
    }

    // Extract tokens
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
        scope: req.query.scope // Store the granted scopes
      })
    });

    console.log('[Google OAuth] Token storage response:', {
      status: storeRes.status,
      ok: storeRes.ok
    });

    if (!storeRes.ok) {
      const errorData = await storeRes.json();
      console.error('[Google OAuth] Token storage error:', errorData);
      return res.status(500).json({ error: 'Failed to store tokens' });
    }

    // Redirect back to the apps page with success parameter
    console.log('[Google OAuth] Authentication successful, redirecting to apps page');
    res.redirect('/admin/dash/apps?auth_status=success');
  } catch (error) {
    console.error('[Google OAuth] Callback error:', error);
    res.redirect('/admin/dash/apps?auth_status=error&message=' + encodeURIComponent(error instanceof Error ? error.message : 'Unknown error'));
  }
} 