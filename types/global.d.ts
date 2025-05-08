interface CredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

interface GsiButtonConfiguration {
  type: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
  locale?: string;
  use_fedcm_for_button?: boolean;
  button_auto_select?: boolean;
}

interface PromptMomentNotification {
  isDisplayed(): boolean;
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
  getDismissedReason(): string;
  getMomentType(): string;
}

interface GsiInitConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
}

interface IdConfiguration {
  client_id: string;
  auto_select?: boolean;
  callback: (response: CredentialResponse) => void;
  login_uri?: string;
  native_callback?: Function;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: string;
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: Function;
  use_fedcm_for_prompt?: boolean;
  use_fedcm_for_button?: boolean;
}

interface Google {
  accounts: {
    id: {
      initialize: (config: IdConfiguration) => void;
      prompt: (callback?: (notification: PromptMomentNotification) => void) => void;
      renderButton: (
        parent: HTMLElement,
        config: GsiButtonConfiguration,
        callback?: (response: CredentialResponse) => void
      ) => void;
      disableAutoSelect: () => void;
      storeCredential: (credential: { id: string; password: string }, callback?: () => void) => void;
      cancel: () => void;
      revoke: (hint: string, callback?: () => void) => void;
    };
  };
}

interface Window {
  google?: Google;
} 