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

const ActionButton = ({ action, onPress }) => {
  const cfgMap = {
    delete: {
      name: 'Delete',
      icon: 'delete',
      style: styles.actionButton,
    },
    change: {
      name: 'Change',
      icon: 'pencil',
      style: styles.actionButton,
    },
    swap: {
      name: 'Swap',
      icon: 'swap-horizontal',
      style: { ...styles.actionButton, marginRight: 0 },
    },
  };
  const cfg = cfgMap[action];
  return <Button compact mode="outlined" icon={cfg.icon} style={cfg.style} onPress={onPress}>{action}</Button>
};

export const SelectedMealModal = ({ meal, onAction }) => {
  const mealSlot = meal.slot.substr(0, 1).toUpperCase() + meal.slot.substr(1);
  const title = `${mealSlot} on ${prettyDate(meal.date)}`;
  const subtitle = meal.name || 'Empty';
  return (
    <View style={styles.viewContainer}>
      <Title style={styles.centerText}>{title}</Title>
      <Subheading style={styles.centerText}>{subtitle}</Subheading>

      <View style={styles.actionButtonContainer}>
        {meal.name !== '' && <ActionButton action="delete" onPress={() => onAction('delete', meal)} />}
        <ActionButton action="change" onPress={() => onAction('change', meal)} />
        <ActionButton action="swap" onPress={() => onAction('swap', meal)} />
      </View>
    </View>
  );
};
