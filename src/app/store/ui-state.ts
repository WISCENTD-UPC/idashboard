export interface UiState {
  errorMessage: string;
  systemInfo: {
    rootUrl: string;
    apiRootUrl: undefined,
    currentVersion: number;
    maxSupportedVersion: number;
    minSupportedVersion: number;
    loaded: boolean;
  };
  dashboardLoaded: boolean;
  dashboardCustomSettingsLoaded: boolean;
  favoriteOptionsLoaded: boolean;
  currentDashboard: string;
}

export const INITIAL_UI_STATE = {
  errorMessage: '',
  systemInfo: {
    rootUrl: undefined,
    apiRootUrl: undefined,
    currentVersion: 2.30,
    maxSupportedVersion: 2.30,
    minSupportedVersion: 2.26,
    loaded: false
  },
  currentDashboard: undefined,
  dashboardLoaded: false,
  dashboardCustomSettingsLoaded: false,
  favoriteOptionsLoaded: false
};
