import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../admin/layout";
import { googleAuthConfig } from "@/config/googleAuthConfig";
import { useRouter } from 'next/router';

const GoogleAuthPage = () => {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check token status in DynamoDB
  const checkTokenStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tokens', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          // Check token validity with Google
          try {
            // First try to get user info to validate token
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                'Authorization': `Bearer ${data.access_token}`
              }
            });

            if (userInfoResponse.ok) {
              const userInfo = await userInfoResponse.json();
              setUserInfo(userInfo);
              setAuthToken(data.access_token);
            } else {
              // If userinfo fails, try to refresh the token if we have a refresh token
              if (data.refresh_token) {
                try {
                  const refreshResponse = await fetch('/api/auth/google/refresh', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      refresh_token: data.refresh_token
                    })
                  });

                  if (refreshResponse.ok) {
                    const newTokenData = await refreshResponse.json();
                    setAuthToken(newTokenData.access_token);
                    setUserInfo(newTokenData.userInfo);
                  } else {
                    throw new Error('Failed to refresh token');
                  }
                } catch (refreshError) {
                  console.error('Error refreshing token:', refreshError);
                  // If refresh fails, remove the token
                  await fetch('/api/tokens', {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  setAuthToken(null);
                  setUserInfo(null);
                  setError('Session expired. Please reconnect.');
                }
              } else {
                // No refresh token, remove the invalid token
                await fetch('/api/tokens', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                setAuthToken(null);
                setUserInfo(null);
                setError('Session expired. Please reconnect.');
              }
            }
          } catch (error) {
            console.error('Error validating token:', error);
            setError('Failed to validate session');
            setAuthToken(null);
            setUserInfo(null);
          }
        } else {
          setAuthToken(null);
          setUserInfo(null);
        }
      } else if (response.status === 404) {
        // No token found, which is fine
        setAuthToken(null);
        setUserInfo(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to check token status');
        setAuthToken(null);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error checking token status:', error);
      setError('Failed to check token status');
      setAuthToken(null);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check token status on mount and when route changes
  useEffect(() => {
    checkTokenStatus();
  }, [checkTokenStatus, router.pathname]);

  useEffect(() => {
    const checkUrlForToken = async () => {
      if (typeof window === "undefined") return;

      // Check for OAuth code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (code) {
        setIsConnecting(true);
        try {
          // Exchange code for tokens via our callback endpoint
          const response = await fetch(`/api/auth/callback?code=${code}`);
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to authenticate with Google');
          }
          // Token will be stored by the callback endpoint
          await checkTokenStatus();
        } catch (error) {
          console.error('Error during authentication:', error);
          setError('Failed to complete authentication');
        } finally {
          setIsConnecting(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (error) {
        setError(`Authentication error: ${urlParams.get("error_description") || error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkUrlForToken();
  }, [checkTokenStatus]);

  const handleConnect = useCallback(() => {
    console.log("[Google OAuth] Starting authentication flow");
    console.log("[Google OAuth] Config:", {
      clientId: googleAuthConfig.clientId ? 'present' : 'missing',
      redirectUri: googleAuthConfig.redirectUri,
      scope: googleAuthConfig.scope
    });
    
    setError(null);
    setIsConnecting(true);

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", googleAuthConfig.clientId);
    authUrl.searchParams.append("redirect_uri", `${window.location.origin}${googleAuthConfig.redirectUri}`);
    authUrl.searchParams.append("response_type", googleAuthConfig.responseType);
    authUrl.searchParams.append("scope", googleAuthConfig.scope);
    authUrl.searchParams.append("access_type", googleAuthConfig.access_type);
    authUrl.searchParams.append("include_granted_scopes", String(googleAuthConfig.include_granted_scopes));
    authUrl.searchParams.append("state", googleAuthConfig.state);
    authUrl.searchParams.append("prompt", googleAuthConfig.prompt);

    console.log("[Google OAuth] Redirecting to:", authUrl.toString());
    window.location.href = authUrl.toString();
  }, []);

  const handleDisconnect = useCallback(async () => {
    console.log("[Disconnect] Removing Google auth token");
    try {
      const response = await fetch('/api/tokens', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAuthToken(null);
        setUserInfo(null);
      } else {
        setError('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setError('Failed to disconnect');
    }
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col h-full min-h-screen bg-white rounded-lg shadow">
        <div className="flex flex-col flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6">Google Authentication</h1>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium mb-2">Error: {error}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="mb-2 font-medium">Status:</p>
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    authToken ? "bg-green-500" : "bg-gray-400"
                  } mr-2`}
                ></div>
                <span
                  className={
                    authToken ? "text-green-700 font-medium" : "text-gray-500"
                  }
                >
                  {isLoading ? "Checking status..." : (authToken ? "Connected to Google" : "Not connected")}
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              {!authToken ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? "Connecting..." : "Connect to Google"}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md text-sm mb-6">
              <p>
                <strong>Warning:</strong> Google Client ID is not configured.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GoogleAuthPage;