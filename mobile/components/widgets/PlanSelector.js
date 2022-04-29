import React, { useState } from 'react';
import {
  Divider, Checkbox, Text, IconButton, Title, Portal, Modal, Button
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  addDays, daysBetween, fromISOString, getShortDayOfTheWeek, getShortMonth, shortPrettyDate, today,
} from '../helpers/date';
import { sortedPlans } from '../helpers/planData';
import { useNavigation } from '@react-navigation/core';
import { Routes } from '../../constants';

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: 'white',
    ...Platform.select({
      web: { flex: 1 },
      android: { flex: 0 },
    }),
  },
  planSelectorActionContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  planSelectorActionPlanTitleText: {
    fontSize: 20,
  },
  planSelectorActionPlanDateSpanText: {
    fontSize: 14,
    color: 'grey',
  },
});

const formatPlanDateSpan = (plan) => {
  const endDate = addDays(fromISOString(plan.startDate), plan.numDays - 1);
  return `${shortPrettyDate(plan.startDate)} - ${shortPrettyDate(endDate)}`;
};

const formatPlanTitle = (plan) => {
  const selectedPlanStartDate = fromISOString(plan.startDate).getTime();
  if (selectedPlanStartDate > today()) {
    const numDays = daysBetween(today(), selectedPlanStartDate);
    const suffix = (numDays === 1) ? 'day' : 'days';
    return `Future plan (in ${numDays} ${suffix})`;
  }
  return 'Currently active plan';
};

export const PlanSelector = ({ planData, selectedPlanId, setSelectedPlanId, readonly }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const planIds = sortedPlans(planData).map((plan) => plan.planId);
  const selectedPlan = planData[selectedPlanId] || planData[planIds[0]];

  const onPlanPress = (planId) => {
    setSelectedPlanId(planId);
    setModalVisible(false);
  };

  const onPlanEditPress = (planId) => {
    setModalVisible(false);
    navigation.navigate(Routes.ModifyPlan, { planId });
  };

  const onCreatePlanPress = () => {
    setModalVisible(false);
    navigation.navigate(Routes.CreateNewPlan);
  };

  const planSelectorActions = planIds.map((planId) => (
    <View key={planId} style={styles.planSelectorActionContainer}>
      <TouchableOpacity onPress={() => onPlanPress(planId)} style={{ flex: 1, flexDirection: 'column' }}>
        <Text style={styles.planSelectorActionPlanTitleText}>{formatPlanTitle(planData[planId])}</Text>
        <Text style={styles.planSelectorActionPlanDateSpanText}>{formatPlanDateSpan(planData[planId])}</Text>
      </TouchableOpacity>
      {!readonly && (
        <TouchableOpacity onPress={() => onPlanEditPress(planId)}>
          <MaterialCommunityIcons name="calendar-edit" size={24} style={{ padding: 4, color: 'grey' }} />
        </TouchableOpacity>
      )}
    </View>
  ));

  const selectedValueSubTitle = formatPlanDateSpan(selectedPlan);
  const selectedValueTitle = formatPlanTitle(selectedPlan);

  return (
    <>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {planSelectorActions}
          {!readonly && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button onPress={() => onCreatePlanPress()} style={{ marginTop: 8 }}>Create new plan</Button>
            </View>
          )}
        </Modal>
      </Portal>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={{ fontSize: 24 }}>{selectedValueTitle}</Text>
          <Text style={{ fontSize: 14, color: 'grey' }}>{selectedValueSubTitle}</Text>
        </View>
        <View>
          <MaterialCommunityIcons name="chevron-right" size={32} style={{ padding: 4, color: 'grey' }} />
        </View>
      </TouchableOpacity>
    </>
  );
};
