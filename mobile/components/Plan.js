import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect } from 'react';
import {
  Platform, Pressable, StyleSheet, View,
} from 'react-native';
import { Portal, Modal, Snackbar, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealPlanServiceCtx } from '../service/context';
import { usePlanModifers } from '../service/mealPlanService';
import { useNavigationFocusListener } from './helpers/navigation';
import { toPlannerGridData } from './helpers/planData';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { PlannerGrid } from './widgets/PlannerGrid';
import { SelectedMealModal } from './widgets/SelectedMealModal';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 12,
  },
  plannerGridContainer: {
    paddingHorizontal: 18,
    paddingTop: 40,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: 'white',
    ...Platform.select({
      web: { flex: 1 },
      android: { flex: 0 },
    }),
  },
});

export default function Plan({ route }) {
  const { params } = route;

  const navigation = useNavigation();
  const [selectedWeek, setSelectedWeek] = useState('thisWeek');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealRecipe, setSelectedMealRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [recipes, setRecipes] = useState(null);
  const [plannerGridData, setPlannerGridData] = useState(null);
  const [swapSource, setSwapSource] = useState(null);
  const [deletedMeal, setDeletedMeal] = useState(null);

  const mealPlanService = React.useContext(MealPlanServiceCtx);
  const api = usePlanModifers({ mealPlanService });

  const refreshPlan = () => {
    setPlannerGridData(null);
    mealPlanService.getPlan()
      .then((response) => {
        const newGridData = toPlannerGridData(response);
        setPlannerGridData(newGridData);
      });
  };

  useNavigationFocusListener(navigation, () => refreshPlan());

  useEffect(() => {
    mealPlanService.getRecipes()
      .then((response) => setRecipes(response));
  }, []);

  useEffect(() => {
    const smr = recipes?.find((recipe) => recipe.name === selectedMeal?.name);
    setSelectedMealRecipe(smr || null);
  }, [selectedMeal]);

  const doMealSwap = ({ source, target }) => {
    setSwapSource(null);
    api.swapMeal({
      src: { date: source.date, slot: source.slot, recipeName: source.name },
      dest: { date: target.date, slot: target.slot, recipeName: target.name },
    });
    refreshPlan();
  };

  const doDeleteMeal = (meal) => {
    api.clearMeal({ date: meal.date, slot: meal.slot });
    setDeletedMeal(meal);
    setSnackBarVisible(true);
    refreshPlan();
  };

  const doUndeleteMeal = () => {
    api.setMeal({ date: deletedMeal.date, slot: deletedMeal.slot, recipeName: deletedMeal.name });
    setDeletedMeal(null);
    refreshPlan();
  };

  const doAddRecipeToPlan = (meal, recipe) => {
    api.setMeal({ date: meal.date, slot: meal.slot, recipeName: recipe.name });
    refreshPlan();
    setTimeout(() => navigation.popToTop(), 1500);
  };

  const onMealSelected = (meal) => {
    if (params?.action === 'add' && params.recipe) {
      doAddRecipeToPlan(meal, params.recipe);
    } else if (swapSource) {
      doMealSwap({ source: swapSource, target: meal });
    } else {
      setSelectedMeal(meal);
      setModalVisible(true);
    }
  };

  const onAction = (action, meal) => {
    setModalVisible(false);
    switch (action) {
      case 'swap':
        setSwapSource(meal);
        break;
      case 'delete':
        doDeleteMeal(meal);
        break;
      case 'change':
        navigation.push('ChooseRecipe', { action: 'select', meal });
        break;
      case 'show-recipe':
        navigation.navigate('RecipeInfo', { recipe: selectedMealRecipe });
        break;
      default:
        console.error(`Unsupported action: ${action}`);
    }
  };

  const navigateToBrowseScreen = () => {
    mealPlanService.autoFocusRecipeSearchBar();
    navigation.navigate('Home', { screen: 'Browse' });
  };

  const FakeSearchbar = () => (
    <Pressable onPress={navigateToBrowseScreen}>
      <View style={{ pointerEvents: 'none' }}>
        <Searchbar editable={false} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {selectedMeal && <SelectedMealModal meal={selectedMeal} hasRecipe={!!selectedMealRecipe} onAction={onAction} />}
        </Modal>
      </Portal>
      <View style={styles.viewContainer}>
        {!plannerGridData
          && <LoadingSpinner message="Fetching meal plan" />}

        {plannerGridData && (
          <>
            <FakeSearchbar />
            <View style={styles.plannerGridContainer}>
              <PlannerGrid
                selectedWeek={selectedWeek}
                swapSource={swapSource}
                onWeekSelected={(week) => setSelectedWeek(week)}
                onMealSelected={onMealSelected}
                gridData={plannerGridData[selectedWeek]}
              />
            </View>
          </>
        )}
      </View>

      <Snackbar
        visible={snackBarVisible}
        onDismiss={() => setSnackBarVisible(false)}
        action={{
          label: 'Undo',
          onPress: () => doUndeleteMeal(),
        }}
      >
        {deletedMeal && `${deletedMeal.name} deleted`}
      </Snackbar>
    </SafeAreaView>
  );
}
