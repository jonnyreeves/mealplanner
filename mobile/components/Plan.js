import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealPlanApiContext } from '../data/apiContext';
import { toPlannerGridData } from './helpers/planData';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { PlannerGrid } from './widgets/PlannerGrid';
import { SelectedMealModal } from './widgets/SelectedMealModal';

export default function Plan({ }) {
    //const navigation = useNavigation();

    const [ selectedWeek, setSelectedWeek ] = useState('thisWeek');
    const [ selectedMeal, setSelectedMeal ] = React.useState(null);
    const [ modalVisible, setModalVisible ] = React.useState(false);


    const api = React.useContext(MealPlanApiContext);
    const [ plannerGridData, setPlannerGridData ] = useState(null);

    React.useEffect(() => {
      api.getPlan()
        .then(response => setPlannerGridData(toPlannerGridData(response)))
    }, []);

    const onMealSelected = meal => {
      setSelectedMeal(meal);
      setModalVisible(true);
    }

    return (
      <SafeAreaView style={styles.viewContainer}>
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            {selectedMeal && <SelectedMealModal meal={selectedMeal} />}
          </Modal>
        </Portal>

        { !plannerGridData && 
          <LoadingSpinner message="Fetching meal plan" />
        }

        { plannerGridData && (
        <PlannerGrid
           selectedWeek={selectedWeek} 
           onWeekSelected={week => setSelectedWeek(week)}
           onMealSelected={onMealSelected}
           gridData={plannerGridData[selectedWeek]} /> 
        ) }
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: "white"
  }
});