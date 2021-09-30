import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button, Subheading, Title,
} from 'react-native-paper';
import { prettyDate } from '../helpers/date';

const styles = StyleSheet.create({
  viewContainer: {
  },
  centerText: {
    textAlign: 'center',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    margin: 10,
  },
  actionButton: {
    marginRight: 8,
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
        <Button mode="outlined" icon="delete" compact style={styles.actionButton}>Delete</Button>
        <Button mode="outlined" icon="pencil" compact style={styles.actionButton}>Change</Button>
        <Button mode="outlined" icon="swap-horizontal" compact style={styles.actionButton}>Swap</Button>
      </View>
    </View>
  );
};
