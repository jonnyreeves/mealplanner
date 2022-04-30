import React from 'react';
import {
  StyleSheet, TouchableOpacity, View, Text,
} from 'react-native';
import {
  Button, Subheading, Title,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { theme } from '../../theme';
import { prettyMealSlot } from '../helpers/date';

const { colors } = theme;

const styles = StyleSheet.create({
  viewContainer: {
    alignItems: 'center',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  actionButton: {
    marginRight: 8,
  },
  viewRecipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginHorizontal: 20,
  },
  viewRecipeText: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.primary,
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
        name: meal.name ? 'Replace' : 'Select',
        icon: 'pencil',
        style: styles.actionButton,
      },
      swap: {
        name: 'Move',
        icon: 'swap-horizontal',
        style: { ...styles.actionButton, marginRight: 0 },
      },
      adjust: {
        name: 'Adjust Ingredients',
        icon: 'scale',
        style: { ...styles.actionButton, marginRight: 0, marginBottom: 8 },
      },
    };
    const cfg = cfgMap[action];
    return <Button compact mode="outlined" icon={cfg.icon} style={cfg.style} onPress={onPress}>{cfg.name}</Button>;
  };

  const title = prettyMealSlot(meal.slot, meal.date);

  const MealName = () => {
    const displayName = meal.name || 'No meal selected';
    if (hasRecipe) {
      return (
        <TouchableOpacity
          style={styles.viewRecipeContainer}
          onPress={() => onAction('show-recipe', meal)}
        >
          <Text style={[styles.viewRecipeText, { marginLeft: 16 }]}>{displayName}</Text>
          <MaterialCommunityIcons name="chevron-right" size={26} style={{ paddingTop: 2, color: colors.primary }} />
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.viewRecipeContainer}>
        <Text style={styles.viewRecipeText}>{displayName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.viewContainer}>
      <Title>{title}</Title>
      <MealName />
      {false && hasRecipe && <ActionButton action="adjust" />}
      <View style={styles.actionButtonContainer}>
        {meal.name !== '' && <ActionButton action="delete" onPress={() => onAction('delete', meal)} />}
        <ActionButton action="change" onPress={() => onAction('change', meal)} />
        <ActionButton action="swap" onPress={() => onAction('swap', meal)} />
      </View>
    </View>
  );
};
