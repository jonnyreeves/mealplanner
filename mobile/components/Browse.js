import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealPlanServiceCtx } from '../service/context';
import { RecipeBrowser } from './widgets/RecipeBrowser';
import { useNavigationFocusListener } from './helpers/navigation';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 12,
  },
});

export default function Browse() {
  const recipeBrowserRef = useRef();
  const navigation = useNavigation();
  const mealPlanService = React.useContext(MealPlanServiceCtx);
  const [recipes, setRecipes] = useState([]);

  useNavigationFocusListener(navigation, () => {
    if (mealPlanService.shouldAutoFocusRecipeSearchbar()) {
      recipeBrowserRef.current?.searchbar.focus();
    }
  });

  useEffect(() => {
    mealPlanService.getRecipes().then((data) => setRecipes(data));
  }, []);

  const onRecipePress = (recipe) => {
    navigation.navigate('RecipeInfo', { recipe });
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      {recipes && (
        <RecipeBrowser ref={recipeBrowserRef} recipes={recipes} onRecipePress={onRecipePress} />
      )}
    </SafeAreaView>
  );
}
