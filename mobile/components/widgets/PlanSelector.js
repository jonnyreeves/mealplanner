import React, { useState } from 'react';
import {
  Divider, Checkbox, Text, IconButton, Title,
} from 'react-native-paper';
import { addDays, fromISOString, getShortDayOfTheWeek, getShortMonth, shortPrettyDate } from '../helpers/date';
import { Picker } from '@react-native-picker/picker';


const formatPlanDuration = (plan) => {
  const endDate = addDays(fromISOString(plan.startDate), plan.numDays - 1);
  return `${shortPrettyDate(plan.startDate)} - ${shortPrettyDate(endDate)}`;
};

export const PlanSelector = ({ planData, selectedPlanId, setSelectedPlanId }) => {
  const planIds = Object.keys(planData);
  const pickerItems = planIds.map((planId) => (
    <Picker.Item key={planId} label={formatPlanDuration(planData[planId])} value={planId} />
  ));

  return (
    <Picker selectedValue={selectedPlanId} onValueChange={(itemValue) => setSelectedPlanId(itemValue)}>
      {pickerItems}
    </Picker>
  );
};
