import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageKeys = {
  RECIPES: '@recipes',
  PLAN_DATA: '@plan_data',
};

export default class LocalStorage {
  constructor(appState) {
    this._appState = appState;
  }

  init() {
    this._appState.addListener('recipes_updated', () => {
      this._onRecipiesUpdate();
    });
    this._appState.addListener('plan_updated', () => {
      this._onPlanUpdated();
    });
  }

  async _onRecipiesUpdated() {
    try {
      const jsonValue = JSON.stringify(this._appState.getRecipes());
      await AsyncStorage.setItem(StorageKeys.RECIPES, jsonValue);
    } catch (e) {
      console.error(`Failed to persist recipes: ${e.message}`, e);
    }
  }

  async _onPlanUpdated() {
    try {
      const jsonValue = JSON.stringify(this._appState.getPlanData());
      await AsyncStorage.setItem(StorageKeys.PLAN_DATA, jsonValue);
    } catch (e) {
      console.error(`Failed to persist recipes: ${e.message}`, e);
    }
  }
}