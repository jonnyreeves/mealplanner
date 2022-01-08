import React, { useState, useEffect, useContext } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { toIngredientList } from './helpers/ingredientList';
import {
  useAppState, useListsUpdatedListener, usePlanUpdatedListener, useRecipesUpdatedListener,
} from './helpers/navigation';
import { toPlannerGridData } from './helpers/planData';
import { ToggleButtonGroup } from './widgets/buttons';
import { MealPlanShoppingList, ShoppingList } from './widgets/ShoppingList';
import { MealPlanApiCtx } from '../service/context';

const styles = StyleSheet.create({
});

export default function List() {
  const appState = useAppState();
  const mealPlanApi = useContext(MealPlanApiCtx);

  const [shoppingLists, setShoppingLists] = useState([]);
  const [planLists, setPlanLists] = useState({});

  const [selectedWeek, setSelectedWeek] = useState('thisWeek');

  const buildPlanList = (gridData, targetWeek) => {
    const recipes = appState.getRecipes();
    const sectionData = [];
    const { ingredients, meals } = toIngredientList(gridData[targetWeek], recipes);
    if (ingredients.length > 0) {
      sectionData.push({
        title: 'Ingredients',
        type: 'ingredients',
        data: ingredients,
      });
    }
    if (meals.length > 0) {
      sectionData.push({ title: 'Meals', type: 'meals', data: meals });
    }
    return sectionData;
  };

  const rebuildPlanLists = () => {
    const planData = appState.getPlanData();
    const gridData = toPlannerGridData(Object.values(planData));
    setPlanLists({
      thisWeek: buildPlanList(gridData, 'thisWeek'),
      nextWeek: buildPlanList(gridData, 'nextWeek'),
    });
  };

  const rebuildShoppingLists = () => {
    const sectionData = [];
    sectionData.push({
      title: 'Alexa Shopping List', type: 'list', listName: 'alexa-shopping', data: appState.getListByName('alexa-shopping'),
    });
    sectionData.push({
      title: 'Regular Items', type: 'list', listName: 'regulars', data: appState.getListByName('regulars'),
    });
    setShoppingLists(sectionData);
  };

  useRecipesUpdatedListener(() => rebuildPlanLists());
  usePlanUpdatedListener(() => rebuildPlanLists());
  useListsUpdatedListener(() => rebuildShoppingLists());

  const [refreshingShoppingList, setRefreshingShoppingList] = useState(false);

  const refreshShoppingList = async () => {
    setRefreshingShoppingList(true);
    await mealPlanApi.fetchLists();
    setRefreshingShoppingList(false);
  };

  useEffect(() => {
    rebuildPlanLists();
    rebuildShoppingLists();
  }, []);

  const openTescoSearch = (searchTerm) => {
    const tescoUrl = `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(searchTerm)}`;
    WebBrowser.openBrowserAsync(tescoUrl);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>

        {selectedWeek === 'lists' && (
          <ShoppingList
            sections={shoppingLists}
            onStoreLinkPress={openTescoSearch}
            onCheckboxPress={(listName, item) => appState.toggleListItem(listName, item)}
            refreshing={refreshingShoppingList}
            onRefresh={refreshShoppingList}
          />
        )}
        {selectedWeek !== 'lists' && (
          <MealPlanShoppingList
            sections={planLists[selectedWeek]}
            selectedWeek={selectedWeek}
            onStoreLinkPress={openTescoSearch}
          />
        )}

        <ToggleButtonGroup selectedValue={selectedWeek} onPress={(value) => setSelectedWeek(value)}>
          <ToggleButtonGroup.Btn label="This Week" value="thisWeek" />
          <ToggleButtonGroup.Btn label="Next Week" value="nextWeek" />
          <ToggleButtonGroup.Btn label="Lists" value="lists" />
        </ToggleButtonGroup>

      </View>
    </SafeAreaView>
  );
}
