import React, { useState, useEffect, useCallback } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import {
  Button, Checkbox, Divider, IconButton, Subheading, Text, Title,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { toIngredientList } from './helpers/ingredientList';
import {
  useAppState, useListsUpdatedListener, usePlanUpdatedListener, useRecipesUpdatedListener,
} from './helpers/navigation';
import { toPlannerGridData } from './helpers/planData';
import { ToggleButtonGroup } from './widgets/WeekSelector';
import { shortPrettyMealSlot } from './helpers/date';
import { MealPlanShoppingList, ShoppingList } from './widgets/ShoppingList';

const styles = StyleSheet.create({
});

export default function List() {
  const appState = useAppState();

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

  useEffect(() => {
    rebuildPlanLists();
    rebuildShoppingLists();
  }, []);

  const openTescoSearch = (searchTerm) => {
    const tescoUrl = `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(searchTerm)}`;
    WebBrowser.openBrowserAsync(tescoUrl);
  };

  const EmptyShoppingList = () => {
    const week = (selectedWeek === 'thisWeek') ? 'this week' : 'next week';
    const msg = `There's nothing on ${week}'s plan`;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <IconButton icon="calendar-alert" color="#d8e2dc" size={128} />
        <Text>{msg}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>

        {selectedWeek === 'lists' && (
          <ShoppingList
            sections={shoppingLists}
            onStoreLinkPress={openTescoSearch}
            onCheckboxPress={(listName, item) => appState.toggleListItem(listName, item)}
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
