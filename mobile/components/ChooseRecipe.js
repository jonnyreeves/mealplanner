import React, {
  useEffect, useRef, useState,
} from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { getDayOfTheWeek } from './helpers/date';
import { RecipeBrowser } from './widgets/RecipeBrowser';
import { useNavigationFocusListener } from './helpers/navigation';
import { useAppState } from '../service/context';

const styles = StyleSheet.create({
  viewContainer: {
  },
});

export default function ChooseRecipe({ route }) {
  const { params } = route;
  const { meal } = params;

  const recipeBrowserRef = useRef();
  const navigation = useNavigation();
  const appState = useAppState();

  const [recipes, setRecipes] = useState([]);

  const getHeaderTitle = () => {
    const prettySlot = meal.slot.substring(0, 1).toUpperCase() + meal.slot.substring(1);
    const dow = getDayOfTheWeek(meal.date);
    return `Choose ${prettySlot} for ${dow}`;
  };

  useNavigationFocusListener(() => {
    navigation.setOptions({ headerTitle: getHeaderTitle() });
    recipeBrowserRef.current?.searchbar.focus();
  });

  useEffect(() => {
    setRecipes(appState.getRecipes());
  }, []);

  const onRecipePress = (recipe) => {
    appState.setPlanEntry({
      date: meal.date, planId: meal.planId, slot: meal.slot, recipeName: recipe.name,
    });
    navigation.popToTop();
  };

  // Process when the user inputs a freeform recipe name which is not associated with
  // a known recipe.
  const onSearchSubmitted = (recipeName) => {
    appState.setPlanEntry({ date: meal.date, planId: meal.planId, slot: meal.slot, recipeName });
    navigation.popToTop();
  };

  return (
    <View style={styles.viewContainer}>
      {recipes && (
        <RecipeBrowser
          showAddToPlanAction
          ref={recipeBrowserRef}
          recipes={recipes}
          onSearchSubmitted={onSearchSubmitted}
          onRecipePress={onRecipePress}
          searchbarPlaceholder="Enter meal name"
        />
      )}
    </View>
  );
}
