import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { Portal, Modal, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealPlanServiceCtx } from '../service/context';
import { toPlannerGridData } from './helpers/planData';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { PlannerGrid } from './widgets/PlannerGrid';
import { SelectedMealModal } from './widgets/SelectedMealModal';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
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
  // const navigation = useNavigation();

  const [selectedWeek, setSelectedWeek] = useState('thisWeek');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [plannerGridData, setPlannerGridData] = useState(null);
  const [swapSource, setSwapSource] = useState(null);
  const [deletedMeal, setDeletedMeal] = useState(null);

  const mealPlanService = React.useContext(MealPlanServiceCtx);

  useEffect(() => {
    mealPlanService.getPlan()
      .then((response) => setPlannerGridData(toPlannerGridData(response)));
  }, []);

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

  const onAction = (action, meal) => {
    setModalVisible(false);
    switch (action) {
      case 'swap':
        setSwapSource(meal);
        break;
      case 'delete':
        doDeleteMeal(meal);
        break;

      default:
        console.error(`Unsupported action: ${action}`);
    }
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {selectedMeal && <SelectedMealModal meal={selectedMeal} onAction={onAction} />}
        </Modal>
      </Portal>

      {swapSource && <></>}

      {!plannerGridData
        && <LoadingSpinner message="Fetching meal plan" />}

      {plannerGridData && (
        <PlannerGrid
          selectedWeek={selectedWeek}
          swapSource={swapSource}
          onWeekSelected={(week) => setSelectedWeek(week)}
          onMealSelected={onMealSelected}
          gridData={plannerGridData[selectedWeek]}
        />
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
