import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { getDayOfTheWeek } from './helpers/date';
import { MealPlanServiceCtx } from '../service/context';
import { usePlanModifers } from '../service/mealPlanService';
import { RecipeBrowser } from './widgets/RecipeBrowser';
import { useNavigationFocusListener } from './helpers/navigation';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 12,
  },
});

export default function ChooseRecipe({ route }) {
  const { params } = route;
  const { meal } = params;

  const recipeBrowserRef = useRef();
  const navigation = useNavigation();

  const mealPlanService = React.useContext(MealPlanServiceCtx);
  const [recipes, setRecipes] = useState([]);

  const api = usePlanModifers({ mealPlanService });

  const getHeaderTitle = () => {
    const prettySlot = meal.slot.substring(0, 1).toUpperCase() + meal.slot.substring(1);
    const dow = getDayOfTheWeek(meal.date);
    return `Choose ${prettySlot} for ${dow}`;
  };

  useNavigationFocusListener(navigation, () => {
    navigation.setOptions({ headerTitle: getHeaderTitle() });
    recipeBrowserRef.current?.searchbar.focus();
  });

  useEffect(() => {
    mealPlanService.getRecipes().then((data) => setRecipes(data));
  }, []);

  const onRecipePress = (recipe) => {
    console.log(`you tapped: ${recipe.name}`);
    console.log(`setMeal => ${meal.date} - ${recipe.name}`);
    api.setMeal({ date: meal.date, slot: meal.slot, recipeName: recipe.name });
    setTimeout(() => navigation.popToTop(), 4);
  };

  // Process when the user inputs a freeform recipe name which is not associated with
  // a known recipe.
  const onSearchSubmitted = (recipeName) => {
    api.setMeal({ date: meal.date, slot: meal.slot, recipeName });
    navigation.popToTop();
  };

  return (
    <View style={styles.viewContainer}>
      {recipes && (
        <RecipeBrowser ref={recipeBrowserRef} recipes={recipes} onSearchSubmitted={onSearchSubmitted} onRecipePress={onRecipePress} />
      )}
    </View>
  );
}
