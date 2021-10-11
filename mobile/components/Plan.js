import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect, useContext } from 'react';
import {
  Linking,
  Platform, Pressable, StyleSheet, View,
} from 'react-native';
import { Portal, Modal, Snackbar, Searchbar, Text, Button, Card, Title, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppStateCtx } from '../service/context';
import { toShortISOString, today } from './helpers/date';
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
    paddingTop: 20,
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
  nextMealCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 0,
  },
  nextMealCardContent: {
    flex: 1,
    paddingLeft: 10,
  },
});

export default function Plan({ route }) {
  const { params } = route;

  const navigation = useNavigation();
  const [selectedWeek, setSelectedWeek] = useState('thisWeek');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [todaysMeal, setTodaysMeal] = useState(null);
  const [selectedMealRecipe, setSelectedMealRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [planEntries, setPlanEntries] = useState([]);

  const [plannerGridData, setPlannerGridData] = useState(null);
  const [swapSource, setSwapSource] = useState(null);
  const [deletedMeal, setDeletedMeal] = useState(null);

  const appState = useContext(AppStateCtx);

  const refresh = () => {
    setRecipes(appState.getRecipes());

    const entries = appState.getPlanEntries();
    setPlanEntries(entries);
    setTodaysMeal(entries.find((item) => item.date === toShortISOString(today())));
    setPlannerGridData(toPlannerGridData(entries));
  };

  useEffect(() => {
    const unsub = appState.addListener('recipes_updated', () => refresh());
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = appState.addListener('plan_updated', () => refresh());
    return () => unsub();
  }, []);

  useNavigationFocusListener(navigation, () => refresh());

  useEffect(() => {
    const smr = recipes?.find((recipe) => recipe.name === selectedMeal?.name);
    setSelectedMealRecipe(smr || null);
  }, [selectedMeal]);

  const doMealSwap = ({ source, target }) => {
    setSwapSource(null);
    appState.swapPlanEntries({
      src: { date: source.date, slot: source.slot, recipeName: source.name },
      dest: { date: target.date, slot: target.slot, recipeName: target.name },
    });
    refresh();
  };

  const doDeleteMeal = (meal) => {
    appState.setPlanEntry({ date: meal.date, slot: meal.slot, recipeName: '' });
    setDeletedMeal(meal);
    setSnackBarVisible(true);
    refresh();
  };

  const doUndeleteMeal = () => {
    appState.setPlanEntry({ date: deletedMeal.date, slot: deletedMeal.slot, recipeName: deletedMeal.name });
    setDeletedMeal(null);
    refresh();
  };

  const onMealSelected = (meal) => {
    if (swapSource) {
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
        navigation.navigate('RecipeInfo', { recipe: selectedMealRecipe, showAddButton: false });
        break;
      default:
        console.error(`Unsupported action: ${action}`);
    }
  };

  const navigateToBrowseScreen = () => {
    appState.autoFocusRecipeSearchbar();
    navigation.navigate('Home', { screen: 'Browse' });
  };

  const FakeSearchbar = () => (
    <Pressable onPress={navigateToBrowseScreen}>
      <View style={{ pointerEvents: 'none' }}>
        <Searchbar editable={false} placeholder="Recipe name" />
      </View>
    </Pressable>
  );

  const NextMealCard = () => {
    const now = new Date();
    const slot = (now.getHours() > 14) ? 'Dinner' : 'Lunch';
    const entry = (slot === 'Dinner') ? todaysMeal.dinner : todaysMeal.lunch;
    const recipe = recipes?.find((r) => r.name === entry.name);
    const isRecipeUrl = recipe?.recipe?.substr(0, 4) === 'http';

    const cardTitle = slot === 'Lunch' ? 'Today\'s Lunch' : 'Tonight\'s Dinner';
    let nextText = entry.name || 'Nothing planned';
    if (!isRecipeUrl && recipe?.recipe) {
      nextText += ` -- 📖 ${recipe.recipe}`;
    }
    const recipeBtn = (
      <Button style={{ marginTop: 'auto' }} compact onPress={() => Linking.openURL(recipe?.recipe)}>Open Recipe</Button>
    );

    return (
      <Surface style={styles.nextMealCard}>
        <View style={styles.nextMealCardContent}>
          <Title style={{ fontSize: 16 }}>{cardTitle}</Title>
          <Text>{nextText}</Text>
        </View>
        {isRecipeUrl && recipeBtn}
      </Surface>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {selectedMeal && <SelectedMealModal meal={selectedMeal} hasRecipe={!!selectedMealRecipe} onAction={onAction} />}
        </Modal>
      </Portal>
      <View style={styles.viewContainer}>
        {!planEntries.length && <LoadingSpinner message="Fetching meal plan" />}

        {planEntries.length > 0 && (
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
            {todaysMeal && <NextMealCard />}
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
