export const APP_CONSTANTS = {
  STORAGE: {
    AUTH_TOKEN_KEY: 'finalprojectdawm.supabase.auth.token',
    REMEMBER_ME_KEY: 'finalprojectdawm-remember-me'
  },

  AUTH: {
    INITIALIZATION_RETRY_INTERVAL: 100,
    DEBOUNCE_TIME: 500,
    PASSWORD_MIN_LENGTH: 6
  },

  UI: {
    LOADING_DELAY: 1000,
    SEARCH_DEBOUNCE: 300
  }
} as const;

export const STORAGE_KEYS = APP_CONSTANTS.STORAGE;
export const AUTH_CONFIG = APP_CONSTANTS.AUTH;
export const UI_CONFIG = APP_CONSTANTS.UI;
