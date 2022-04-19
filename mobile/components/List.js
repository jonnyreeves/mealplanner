import React, { useState, useEffect } from 'react';
import { Linking, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toIngredientList } from './helpers/ingredientList';
import {
  useListsUpdatedListener, usePlanUpdatedListener, useRecipesUpdatedListener,
} from './helpers/navigation';
import { toPlannerGridData, usePlanSelector } from './helpers/planData';
import { ToggleButtonGroup } from './widgets/buttons';
import { MealPlanShoppingList, ShoppingList } from './widgets/ShoppingList';
import { useAppState, useMealPlanApi } from '../service/context';
import { PlanSelector } from './widgets/PlanSelector';
import { LoadingSpinner } from './widgets/modals';

export default function List() {
  const appState = useAppState();
  const mealPlanApi = useMealPlanApi();

  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedPlanListSections, setSelectedPlanListSections] = useState([]);
  const { selectedPlanId, setSelectedPlanId } = usePlanSelector();
  const [listMode, setListMode] = useState('plan');
  const [buildingListSections, setBuildingListSections] = useState(false);

  const buildSelectedPlanListSections = (gridData) => {
    const recipes = appState.getRecipes();
    const sectionData = [];
    const { ingredients, meals } = toIngredientList(gridData, recipes);
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
    if (!selectedPlanId) {
      return;
    }
    const planData = appState.getPlanData();
    const result = buildSelectedPlanListSections(toPlannerGridData(planData[selectedPlanId]));
    setSelectedPlanListSections(result);
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
    rebuildShoppingLists();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      rebuildPlanLists();
    }
  }, [selectedPlanId]);

  useEffect(() => {
    setBuildingListSections(false);
  }, [selectedPlanListSections]);

  const openTescoSearch = (searchTerm) => {
    const tescoUrl = `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(searchTerm)}`;
    Linking.openURL(tescoUrl);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        {listMode === 'lists' && (
          <ShoppingList
            sections={shoppingLists}
            onStoreLinkPress={openTescoSearch}
            onCheckboxPress={(listName, item) => appState.toggleListItem(listName, item)}
            refreshing={refreshingShoppingList}
            onRefresh={refreshShoppingList}
          />
        )}
        {listMode !== 'lists' && Boolean(selectedPlanId) && (
          <>
            <View style={{ margin: 20 }}>
              <PlanSelector planData={appState.getPlanData()} selectedPlanId={selectedPlanId} setSelectedPlanId={setSelectedPlanId} />
            </View>
            <MealPlanShoppingList
              sections={selectedPlanListSections}
              buildingListSections={buildingListSections}
              selectedPlanId={selectedPlanId}
              onStoreLinkPress={openTescoSearch}
            />
          </>
        )}
        {listMode !== 'lists' && Boolean(selectedPlanId) === false && (
          <View style={{ height: 400 }}>
            <LoadingSpinner />
          </View>
        )}

        <ToggleButtonGroup selectedValue={listMode} onPress={(value) => setListMode(value)}>
          <ToggleButtonGroup.Btn label="Groceries" value="plan" />
          <ToggleButtonGroup.Btn label="Shopping Lists" value="lists" />
        </ToggleButtonGroup>

      </View>
    </SafeAreaView>
  );
}
