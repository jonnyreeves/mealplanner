import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button, Subheading, Title,
} from 'react-native-paper';
import { prettyMealSlot } from '../helpers/date';

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

export const SelectedMealModal = ({ meal, hasRecipe, onAction }) => {
  const ActionButton = ({ action, onPress }) => {
    const cfgMap = {
      delete: {
        name: 'Clear',
        icon: 'delete',
        style: styles.actionButton,
      },
      change: {
        name: meal.name ? 'Change' : 'Select',
        icon: 'pencil',
        style: styles.actionButton,
      },
      swap: {
        name: 'Move',
        icon: 'swap-horizontal',
        style: { ...styles.actionButton, marginRight: 0 },
      },
    };
    const cfg = cfgMap[action];
    return <Button compact mode="outlined" icon={cfg.icon} style={cfg.style} onPress={onPress}>{cfg.name}</Button>;
  };

  const title = prettyMealSlot(meal.slot, meal.date);
  const subtitle = meal.name || 'Empty';

  const ViewRecipeInfo = () => (
    <Button onPress={() => onAction('show-recipe', meal)}>View Recipe</Button>
  );

  return (
    <View style={styles.viewContainer}>
      <Title style={styles.centerText}>{title}</Title>
      <Subheading style={styles.centerText}>{subtitle}</Subheading>
      {hasRecipe && <ViewRecipeInfo />}
      <View style={styles.actionButtonContainer}>
        {meal.name !== '' && <ActionButton action="delete" onPress={() => onAction('delete', meal)} />}
        <ActionButton action="change" onPress={() => onAction('change', meal)} />
        <ActionButton action="swap" onPress={() => onAction('swap', meal)} />
      </View>
    </View>
  );
};
