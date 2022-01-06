import React, {
  useContext, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import {
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FAB, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeBrowser } from './widgets/RecipeBrowser';
import {
  useAppState, useNavigationFocusListener, useRecipesUpdatedListener, useSessionState,
} from './helpers/navigation';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { Routes } from '../constants';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  addRecipeFAB: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default function Browse({ route }) {
  const { createdRecipeTitle } = route.params || {};

  const recipeBrowserRef = useRef();
  const navigation = useNavigation();

  const [recipes, setRecipes] = useState([]);
  const [addedRecipeNotificationVisible, setAddedRecipeNotificationVisible] = useState(false);

  const appState = useAppState();
  const sessionState = useSessionState();

  const refresh = () => setRecipes(appState.getRecipes());

  useRecipesUpdatedListener(() => refresh());

  useLayoutEffect(() => {
    setAddedRecipeNotificationVisible(!!createdRecipeTitle);
  }, [createdRecipeTitle]);

  useNavigationFocusListener(() => {
    refresh();
    if (sessionState.shouldAutoFocusRecipeSearchbar()) {
      recipeBrowserRef.current?.searchbar.focus();
    }
    sessionState.clearRecipeModificationState();
  });

  const onRecipePress = (recipe) => {
    navigation.navigate(Routes.ViewRecipe, { recipeId: recipe.id, showAddButton: true });
  };

  const hasRecipes = recipes.length > 0;

  return (
    <>
      <SafeAreaView style={styles.viewContainer}>
        {!hasRecipes && <LoadingSpinner message="Fetching recipes" />}
        {hasRecipes && (
          <RecipeBrowser
            ref={recipeBrowserRef}
            recipes={recipes}
            onRecipePress={onRecipePress}
          />
        )}
        <FAB style={styles.addRecipeFAB} icon="plus" onPress={() => navigation.navigate(Routes.CreateRecipe)} />
      </SafeAreaView>
      <Snackbar
        visible={addedRecipeNotificationVisible}
        onDismiss={() => setAddedRecipeNotificationVisible(false)}
        duration={5000}
      >
        Added Recipe:
        {' '}
        {createdRecipeTitle}
      </Snackbar>
    </>
  );
}
