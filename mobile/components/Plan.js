import { useFocusEffect, useNavigation } from '@react-navigation/core';
import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  BackHandler,
  Linking,
  Platform, RefreshControl, StyleSheet, View,
} from 'react-native';
import {
  Portal, Modal, Snackbar, Text, Button, Title, Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Routes } from '../constants';
import { useAppState, useMealPlanApi } from '../service/context';
import { theme } from '../theme';

import {
  useNavigationFocusListener, usePlanUpdatedListener,
} from './helpers/navigation';
import { LoadingSpinner } from './widgets/modals';
import { PlanCarousel } from './widgets/PlanCarousel';
import { SelectedMealModal } from './widgets/SelectedMealModal';

const { defaultStyles } = theme;

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  plannerGridContainer: {
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  selectedMealModal: {
    ...defaultStyles.modal,
  },
});

export default function Plan() {
  const navigation = useNavigation();
  const appState = useAppState();
  const mealPlanApi = useMealPlanApi();

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealRecipe, setSelectedMealRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [planData, setPlanData] = useState(null);
  const [swapSource, setSwapSource] = useState(null);
  const [deletedMeal, setDeletedMeal] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    console.log('refreshing plan');
    setPlanData(appState.getPlanData());
  };

  const doRefresh = async () => {
    setRefreshing(true);
    await mealPlanApi.fetchPlan();
    refresh();
    setRefreshing(false);
  };

  usePlanUpdatedListener(() => refresh());
  useNavigationFocusListener(() => refresh());

  useFocusEffect(useCallback(() => {
    const onBackPress = () => {
      if (swapSource) {
        setSwapSource(null);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [swapSource, setSwapSource]));

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (swapSource) {
        setSwapSource(null);
        return true;
      }
      return false;
    });
  }, []);

  useEffect(() => {
    if (selectedMeal) {
      setSelectedMealRecipe(appState.findRecipeByName(selectedMeal.name));
    }
  }, [selectedMeal]);

  const hasPlanData = planData && Object.keys(planData).length > 0;

  const doMealSwap = ({ source, target }) => {
    setSwapSource(null);
    appState.swapPlanEntries({
      src: {
        date: source.date,
        slot: source.slot,
        planId: source.planId,
        recipeName: source.name,
      },
      dest: {
        date: target.date,
        slot: target.slot,
        planId: target.planId,
        recipeName: target.name,
      },
    });
    refresh();
  };

  const doDeleteMeal = (meal) => {
    appState.setPlanEntry({
      date: meal.date,
      slot: meal.slot,
      planId: meal.planId,
      recipeName: '',
    });
    setDeletedMeal(meal);
    setSnackBarVisible(true);
    refresh();
  };

  const doUndeleteMeal = () => {
    appState.setPlanEntry({
      date: deletedMeal.date,
      slot: deletedMeal.slot,
      planId: deletedMeal.planId,
      recipeName: deletedMeal.name,
    });
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
        navigation.navigate(Routes.ViewRecipe, { recipeId: selectedMealRecipe.id, showAddButton: false });
        break;
      default:
        console.error(`Unsupported action: ${action}`);
    }
  };

  const UndoDeletedMealSnackbar = () => (
    <Snackbar
      visible={snackBarVisible}
      onDismiss={() => setSnackBarVisible(false)}
      action={{ label: 'Undo', onPress: doUndeleteMeal }}
    >
      {deletedMeal && `${deletedMeal.name} deleted`}
    </Snackbar>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.selectedMealModal}>
          {selectedMeal && <SelectedMealModal meal={selectedMeal} hasRecipe={!!selectedMealRecipe} onAction={onAction} />}
        </Modal>
      </Portal>
      <View style={styles.viewContainer}>
        {hasPlanData && (
          <PlanCarousel
            showTodayView
            planData={planData}
            swapSource={swapSource}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={doRefresh} />}
            onMealSelected={onMealSelected}
          />
        )}
        {!hasPlanData && (
          <LoadingSpinner message="Fetching meal plan" />
        )}
      </View>
      <UndoDeletedMealSnackbar />
    </SafeAreaView>
  );
}
