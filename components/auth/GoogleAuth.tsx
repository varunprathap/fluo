import { useEffect } from 'react';

// Google Identity Services type definitions
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            context?: string;
            ux_mode?: string;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
              width?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export function loadGoogleScript() {
  if (document.getElementById('google-signin-script')) return;

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.id = 'google-signin-script';
  document.body.appendChild(script);
}

export function initializeGoogleAuth(clientId: string, callback: (response: { credential: string }) => void) {
  if (!window.google?.accounts) return false;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback,
    context: 'use',
    ux_mode: 'popup',
    auto_select: false,
    cancel_on_tap_outside: true
  });

  return true;
}

export function renderGoogleButton(container: HTMLElement) {
  if (!window.google?.accounts) return;

  window.google.accounts.id.renderButton(
    container,
    {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '240',
    }
  );
}

export function promptGoogleSignIn() {
  if (!window.google?.accounts) return;
  window.google.accounts.id.prompt();
} 