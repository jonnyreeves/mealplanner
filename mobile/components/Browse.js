import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppStateCtx } from '../service/context';
import { RecipeBrowser } from './widgets/RecipeBrowser';
import { useNavigationFocusListener } from './helpers/navigation';
import { LoadingSpinner } from './widgets/LoadingSpinner';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 12,
  },
});

export default function Browse() {
  const recipeBrowserRef = useRef();
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);

  const appState = useContext(AppStateCtx);

  const refresh = () => {
    setRecipes(appState.getRecipes());
  };

  useEffect(() => {
    const unsub = appState.addListener('recipes_updated', () => refresh());
    return () => unsub();
  }, []);

  useNavigationFocusListener(navigation, () => {
    refresh();
    if (appState.shouldAutoFocusRecipeSearchbar()) {
      recipeBrowserRef.current?.searchbar.focus();
    }
  });

  const onRecipePress = (recipe) => {
    navigation.navigate('RecipeInfo', { recipe, showAddButton: true });
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      {!recipes?.length && <LoadingSpinner message="Fetching recipes" />}
      {recipes?.length > 0 && <RecipeBrowser ref={recipeBrowserRef} recipes={recipes} onRecipePress={onRecipePress} />}
    </SafeAreaView>
  );
}
