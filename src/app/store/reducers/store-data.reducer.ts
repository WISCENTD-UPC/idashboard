import {StoreData, INITIAL_STORE_DATA} from "../store-data";
export function storeDataReducer(state: StoreData = INITIAL_STORE_DATA, action) {
  switch (action.type) {
    case 'CURRENT_USER_LOADED_ACTION': {
      const newState = Object.assign({}, state);
      newState.currentUser = action.payload;
      return newState;
    }

    case 'DASHBOARDS_LOADED_ACTION': {
      const newState = Object.assign({}, state);
      newState.dashboards = action.payload;
      return newState;
    }

    case 'DASHBOARD_UPDATED_ACTION': {
      const newState = Object.assign({}, state);
      newState.dashboards = action.payload;
      return newState;
    }

    case 'VISUALIZATION_OBJECT_LOADED_ACTION': {
      state.visualizationObjects = [...state.visualizationObjects, action.payload];
      return state;
    }

    default:
      return state;
  }
}