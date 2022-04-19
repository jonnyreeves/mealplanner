import React, { useState } from 'react';
import {
  Divider, Checkbox, Text, IconButton, Title,
} from 'react-native-paper';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  addDays, daysBetween, fromISOString, getShortDayOfTheWeek, getShortMonth, shortPrettyDate, today,
} from '../helpers/date';
import { sortedPlans } from '../helpers/planData';

const formatPlanTitle = (plan) => {
  const endDate = addDays(fromISOString(plan.startDate), plan.numDays - 1);
  return `${shortPrettyDate(plan.startDate)} - ${shortPrettyDate(endDate)}`;
};

const formatPlanSubtitle = (plan) => {
  const selectedPlanStartDate = fromISOString(plan.startDate).getTime();
  if (selectedPlanStartDate > today()) {
    const numDays = daysBetween(today(), selectedPlanStartDate);
    const suffix = (numDays === 1) ? 'day' : 'days';
    return `Future plan (in ${numDays} ${suffix})`;
  }
  return 'Currently active plan';
};

export const PlanSelector = ({ planData, selectedPlanId, setSelectedPlanId }) => {
  const planIds = sortedPlans(planData).map((plan) => plan.planId);
  const selectedPlan = (selectedPlanId) ? planData[selectedPlanId] : planData[planIds[0]];

  const pickerItems = planIds.map((planId) => (
    <Picker.Item key={planId} label={formatPlanSubtitle(planData[planId])} value={planId} />
  ));

  const selectedValueSubTitle = formatPlanTitle(selectedPlan);
  const selectedValueTitle = formatPlanSubtitle(selectedPlan);

  return (
    <View style={{ height: 44 }}>
      <Text
        style={{
          fontSize: 24,
          position: 'absolute',
        }}
      >
        {selectedValueTitle}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: 'grey',
          top: 28,
          position: 'absolute',
        }}
      >
        {selectedValueSubTitle}
      </Text>
      <Picker
        style={{ opacity: 0 }}
        mode="dropdown"
        selectedValue={selectedPlanId}
        onValueChange={(itemValue) => setSelectedPlanId(itemValue)}
      >
        {pickerItems}
      </Picker>
    </View>
  );
};
