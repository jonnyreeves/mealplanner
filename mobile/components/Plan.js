import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Portal, Modal, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealPlanServiceCtx } from '../service/context';
import { toPlannerGridData } from './helpers/planData';
import { Glass } from './widgets/Glass';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { PlannerGrid } from './widgets/PlannerGrid';
import { RecipeSearch } from './widgets/RecipeSearch';
import { SelectedMealModal } from './widgets/SelectedMealModal';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
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

export default function Plan() {
  const navigation = useNavigation();
  const inputRef = useRef();

  const [selectedWeek, setSelectedWeek] = useState('thisWeek');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealRecipe, setSelectedMealRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [glassVisible, setGlassVisible] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [recipes, setRecipes] = useState(null);
  const [plannerGridData, setPlannerGridData] = useState(null);
  const [swapSource, setSwapSource] = useState(null);
  const [deletedMeal, setDeletedMeal] = useState(null);

  const mealPlanService = React.useContext(MealPlanServiceCtx);

  useEffect(() => {
    mealPlanService.getPlan()
      .then((response) => setPlannerGridData(toPlannerGridData(response)));
    mealPlanService.getRecipes()
      .then((response) => setRecipes(response));
  }, []);

  useEffect(() => {
    const smr = recipes?.find((recipe) => recipe.name === selectedMeal.name);
    setSelectedMealRecipe(smr || null);
  }, [selectedMeal]);

  const mutateGridData = (mutations) => {
    const newGridData = { ...plannerGridData };
    let dirty = false;

    const gridDataMapper = (mutation) => (item) => {
      const { mealId, mealName } = mutation;
      if (item.id === mealId) {
        dirty = true;
        return { ...item, name: mealName };
      }
      return item;
    };

    mutations.forEach((mutation) => {
      newGridData.thisWeek = newGridData.thisWeek.map(gridDataMapper(mutation));
      newGridData.nextWeek = newGridData.nextWeek.map(gridDataMapper(mutation));
    });

    if (dirty) {
      setPlannerGridData(newGridData);
    }
    return dirty;
  };

  const doMealSwap = ({ source, target }) => {
    mutateGridData([
      { mealId: source.id, mealName: target.name },
      { mealId: target.id, mealName: source.name },
    ]);
    setSwapSource(null);

    let entryMap;
    if (source.date === target.date) {
      entryMap = { [source.date]: { [source.slot]: target.name, [target.slot]: source.name } };
    } else {
      entryMap = {
        [source.date]: { [source.slot]: target.name },
        [target.date]: { [target.slot]: source.name },
      };
    }
    mealPlanService.updatePlan(entryMap);
  };

  const doDeleteMeal = (meal) => {
    const hasChange = mutateGridData([{ mealId: meal.id, mealName: '' }]);
    if (hasChange) {
      setDeletedMeal(meal);
      setSnackBarVisible(true);
      mealPlanService.updatePlan({
        [meal.date]: { [meal.slot]: '' },
      });
    }
  };

  const doUndeleteMeal = () => {
    const hasChange = mutateGridData([{ mealId: deletedMeal.id, mealName: deletedMeal.name }]);
    if (hasChange) {
      mealPlanService.updatePlan({
        [deletedMeal.date]: { [deletedMeal.slot]: deletedMeal.name },
      });
    }
  };

  const onMealSelected = (meal) => {
    if (swapSource) {
      doMealSwap({ source: swapSource, target: meal });
    } else {
      setSelectedMeal(meal);
      setModalVisible(true);
    }
  };

  const doEditMeal = (meal) => {
    setSwapSource(meal);
    setGlassVisible(true);
    inputRef.current.focus();
  };

  const doSetMeal = (recipe) => {
    const hasChange = mutateGridData([{ mealId: swapSource.id, mealName: recipe.name }]);
    if (hasChange) {
      mealPlanService.updatePlan({
        [swapSource.date]: { [swapSource.slot]: recipe.name },
      });
    }
    setSwapSource(null);
    setGlassVisible(false);
  };

  const onSearchEntry = (recipe) => {
    if (!recipe) {
      return;
    }
    console.log(`onSearchEntry: ${recipe.name}`);
    if (swapSource) {
      doSetMeal(recipe);
    } else {
      navigation.navigate('RecipeInfo', { recipe });
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
        doEditMeal(meal);
        break;
      case 'show-recipe':
        navigation.navigate('RecipeInfo', { recipe: selectedMealRecipe });
        break;
      default:
        console.error(`Unsupported action: ${action}`);
    }
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {selectedMeal && <SelectedMealModal meal={selectedMeal} hasRecipe={!!selectedMealRecipe} onAction={onAction} />}
        </Modal>
      </Portal>

      {!plannerGridData
        && <LoadingSpinner message="Fetching meal plan" />}

      {plannerGridData && (
        <>
          <View style={{ marginTop: 0, marginLeft: 30, marginRight: 30 }}>
            <RecipeSearch recipes={recipes} inputRef={inputRef} onSelect={(recipe) => onSearchEntry(recipe)} />
            <View style={{ marginTop: 100 }}>
              <PlannerGrid
                selectedWeek={selectedWeek}
                swapSource={swapSource}
                onWeekSelected={(week) => setSelectedWeek(week)}
                onMealSelected={onMealSelected}
                gridData={plannerGridData[selectedWeek]}
              />
            </View>
            <Glass visible={glassVisible} />
          </View>
        </>
      )}


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
