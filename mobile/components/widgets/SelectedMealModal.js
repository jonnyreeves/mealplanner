import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button, Subheading, Title,
} from 'react-native-paper';
import { prettyDate } from '../helpers/date';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  actionButtonContainer: {
  },
});

export const SelectedMealModal = ({ meal }) => {
  const mealSlot = meal.slot.substr(0, 1).toUpperCase() + meal.slot.substr(1);
  const title = `${mealSlot} on ${prettyDate(meal.date)}`;
  const subtitle = meal.name || 'Empty';
  return (
    <View style={styles.viewContainer}>
      <Title style={styles.centerText}>{title}</Title>
      <Subheading style={styles.centerText}>{subtitle}</Subheading>

      <View style={styles.actionButtonContainer}>
        <Button mode="outlined" style={{ marginRight: 10 }}>Delete Meal</Button>
        <Button mode="outlined" style={{ marginRight: 10 }}>Change Meal</Button>
        <Button mode="outlined">Swap Meal</Button>
      </View>
    </View>
  );
};
