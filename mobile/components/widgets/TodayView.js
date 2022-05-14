import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { useAppState } from '../../service/context';
import { today, toShortISOString } from '../helpers/date';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

const { colors } = theme;

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  mealCard: {
    marginBottom: 20,
  },
  recipeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  recipeText: {
    fontSize: 18,
    color: colors.primary,
  },
  mealNameText: {
    fontSize: 20,
  },
  slotText: {
    fontSize: 24,
  },
});

export const TodayView = ({ planData }) => {
  const appState = useAppState();

  const findTodaysEntry = () => {
    const t = toShortISOString(today());
    let result = { date: t };
    Object.keys(planData).forEach((planId) => {
      const plan = planData[planId];
      const entry = plan.entries.find((e) => e.date === t);
      if (entry) {
        result = entry;
      }
    });
    return result;
  };

  const MealRecipe = ({ recipe }) => {
    if (!recipe.source) return (<></>);
    const isHttpLink = recipe.source?.substr(0, 4) === 'http';
    if (isHttpLink) {
      return (
        <TouchableOpacity style={styles.recipeContainer} onPress={() => Linking.openURL(recipe.source)}>
          <Text style={styles.recipeText}>Open Recipe</Text>
          <MaterialCommunityIcons name="chevron-right" size={26} style={{ color: colors.primary }} />
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.recipeContainer}>
        <Text style={styles.recipeText}>{recipe.source}</Text>
      </View>
    );
  };

  const MealCard = ({ slot, meal }) => {
    const r = appState.findRecipeByName(meal.name);
    console.log(r);
    return (
      <Card style={styles.mealCard}>
        <Card.Content>
          <Title style={styles.slotText}>Today's {slot}</Title>
          <Text style={styles.mealNameText}>{meal.name}</Text>
          {r !== null && <MealRecipe recipe={r} />}
        </Card.Content>
      </Card>
    );
  };

  const NothingPlannedCard = () => (
    <Card style={styles.mealCard}>
      <Card.Content>
        <Title style={styles.slotText}>Nothing planned for today!</Title>
        <Text style={styles.mealNameText}>Why not go plan something?</Text>
      </Card.Content>
    </Card>
  )

  const entry = findTodaysEntry();
  const nothingPlanned = !entry.lunch?.name && !entry.dinner?.name;

  return (
    <View style={styles.container}>
      {nothingPlanned && <NothingPlannedCard />}
      {!nothingPlanned && (
        <>
          {!!entry.lunch?.name && <MealCard slot="lunch" meal={entry.lunch} />}
          {!!entry.dinner?.name && <MealCard slot="dinner" meal={entry.dinner} />}
        </>
      )}

    </View>
  );
};
