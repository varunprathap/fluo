import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../admin/layout";
import { googleAuthConfig } from "@/config/googleAuthConfig";

const GoogleAuthPage = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const { clientId, redirectUri, scope, responseType } = googleAuthConfig;

  useEffect(() => {
    const checkUrlForToken = async () => {
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
          setAuthToken(accessToken);
          window.history.replaceState({}, document.title, window.location.pathname);

          // Send the token to the server
          await fetch("/api/tokens", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: accessToken }),
          });
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const errorMsg = urlParams.get("error");
      if (errorMsg) {
        setError(`Authentication error: ${errorMsg}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    setIsConnecting(false);
    checkUrlForToken();
  }, []);

  const handleConnect = useCallback(() => {
    console.log("[Connect] Redirecting to Google auth");
    setError(null);
    setIsConnecting(true);

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", responseType);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("include_granted_scopes", "true");
    authUrl.searchParams.append("state", "pass-through-value");

    window.location.href = authUrl.toString();
  }, [clientId, redirectUri, responseType, scope]);

  const handleDisconnect = useCallback(() => {
    console.log("[Disconnect] Removing Google auth token");
    setAuthToken(null);
    setUserInfo(null);
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
                  {authToken ? "Connected to Google" : "Not connected"}
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              {!authToken ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? "Connecting..." : "Connect to Google"}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {!clientId && (
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