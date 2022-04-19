import React from 'react';
import { Text } from 'react-native-paper';

export default function ModifyPlan({ route }) {
  const { planId } = route.params;
  return (
    <Text>Modify Existing Plan: {planId}</Text>
  );
};