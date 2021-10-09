import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { getDayOfTheWeek } from './helpers/date';
import { MealPlanServiceCtx } from '../service/context';
import { usePlanModifers } from '../service/mealPlanService';
import RecipeBrowser from './widgets/RecipeBrowser';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 12,
  },
});

export default function ChooseRecipe({ route }) {
  const { params } = route;
  const { meal, action } = params;

  const navigation = useNavigation();

  const mealPlanService = React.useContext(MealPlanServiceCtx);
  const [recipes, setRecipes] = useState([]);

  const api = usePlanModifers({ mealPlanService });

  const getHeaderTitle = () => {
    const prettySlot = meal.slot.substring(0, 1).toUpperCase() + meal.slot.substring(1);
    const dow = getDayOfTheWeek(meal.date);
    return `Choose ${prettySlot} for ${dow}`;
  }

  useEffect(() => {
    mealPlanService.getRecipes().then((data) => setRecipes(data));
    const unsub = navigation.addListener('focus', () => {
      navigation.setOptions({ headerTitle: getHeaderTitle() });
    });
    return () => unsub();
  }, []);

  const onRecipePress = (recipe) => {
    console.log(`you tapped: ${recipe.name}`);
    if (action === 'select') {
      console.log(`setMeal => ${meal.date} - ${recipe.name}`);
      api.setMeal({ date: meal.date, slot: meal.slot, recipeName: recipe.name });
      setTimeout(() => navigation.popToTop(), 4);
    }
  };
  return (
    <View style={styles.viewContainer}>
      {recipes && (
        <RecipeBrowser recipes={recipes} autoFocusSearch onRecipePress={onRecipePress} />
      )}
    </View>
  );
}
