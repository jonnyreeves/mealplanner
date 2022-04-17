/* eslint-disable class-methods-use-this */
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageKeys = {
  RECIPES: '@recipes',
  PLAN_DATA_V2: '@plan_data_v2',

  PLAN_DATA_V1: '@plan_data',
};

export default class LocalStorage {
  bind({ appState }) {
    this._appState = appState;

    appState.addListener('recipes_updated', () => {
      this._onRecipesUpdated();
    });
    appState.addListener('plan_updated', () => {
      this._onPlanUpdated();
    });

    AsyncStorage.removeItem(StorageKeys.PLAN_DATA_V1);
  }

  async _read(key) {
    try {
      const jsonStr = await AsyncStorage.getItem(key);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error(`Failed to retrieve ${key}: ${e.message}`, e);
      await AsyncStorage.removeItem(key);
      return null;
    }
  }

  async getRecipes() {
    return this._read(StorageKeys.RECIPES);
  }

  async getPlanData() {
    return this._read(StorageKeys.PLAN_DATA_V2);
  }

  async _onRecipesUpdated() {
    try {
      const jsonValue = JSON.stringify(this._appState.getRecipesById());
      await AsyncStorage.setItem(StorageKeys.RECIPES, jsonValue);
    } catch (e) {
      console.error(`Failed to persist recipes: ${e.message}`, e);
    }
  }

  async _onPlanUpdated() {
    try {
      const jsonValue = JSON.stringify(this._appState.getPlanData());
      await AsyncStorage.setItem(StorageKeys.PLAN_DATA_V2, jsonValue);
    } catch (e) {
      console.error(`Failed to persist recipes: ${e.message}`, e);
    }
  }
}
