import { useEffect } from 'react';

export default function AuthCallback() {
  useEffect(() => {
    // Extract the token from the URL hash
    const extractTokenFromHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        return params.get('access_token');
      }
      return null;
    };

    // Process the authentication result
    const processAuthResult = () => {
      try {
        const token = extractTokenFromHash();
        
        if (token) {
          // Pass the token back to the opener (parent window)
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH', token },
              window.location.origin
            );
          }
        } else {
          // Check for errors in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const errorMsg = urlParams.get('error');
          
          if (errorMsg && window.opener && !window.opener.closed) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_ERROR', error: errorMsg },
              window.location.origin
            );
          }
        }
      } finally {
        // Close the popup window
        window.close();
      }
    };

    processAuthResult();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-xl mb-4">Authentication Complete</h1>
        <p>Completing authentication, this window will close automatically...</p>
      </div>
    </div>
  );
}
