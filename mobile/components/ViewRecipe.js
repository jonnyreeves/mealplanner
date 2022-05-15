import React, { useState } from 'react';
import {
  Linking, StyleSheet, View, ScrollView, TouchableOpacity,
} from 'react-native';
import {
  Title, Button, Text, Subheading, FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';

import { useAppState } from '../service/context';
import { LoadingSpinner } from './widgets/modals';
import { ChipList } from './widgets/chips';
import { Routes } from '../constants';
import { IngredientsTable } from './widgets/tables';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { prettyMealSlot } from './helpers/date';

const { colors } = theme;

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 22,
  },
  addToPlanBtn: {
    marginBottom: 80,
  },
  planInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 8,
  },
  planInfoDateText: {
    paddingLeft: 4,
    fontSize: 16,
  },
  planInfoDateIcon: {
    color: 'gray',
  },
  ingredientTableHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  recipeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  recipeText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
  },
  tagListContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 0,
  },
});

export default function ViewRecipe({ route }) {
  const { recipeId, showAddButton, mealDate, mealSlot } = route.params;
  const isPlannedMeal = !!(mealSlot && mealDate);

  const navigation = useNavigation();
  const appState = useAppState();

  const [recipe, setRecipe] = useState(null)

  useFocusEffect(() => {
    setRecipe(appState.getRecipeById(recipeId));
  });

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  const onAddToPlan = () => {
    navigation.push('AddRecipeToPlan', { recipe });
  };

  const onModifyPlannedIngredients = () => {
    // TODO.
  };

  const MealIngredients = () => (
    <>
      <View style={styles.ingredientTableHeaderContainer}>
        <Subheading>Ingredients</Subheading>
        {isPlannedMeal && (<Button compact icon="pencil" onPress={onModifyPlannedIngredients}>Modify</Button>)}
      </View>
      <IngredientsTable ingredients={recipe.ingredients} />
    </>
  );

  const MealTags = () => (
    <>
      <ChipList items={recipe.tags} containerStyle={styles.tagListContainer} />
    </>
  );

  const MealRecipe = () => {
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
        <Text style={styles.recipeText}>{recipe.source || 'No recipe'}</Text>
      </View>
    );
  };

  const HeaderButtons = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
      <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-start' }} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} style={{ color: 'black' }} />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {showAddButton && <AddToPlanButton />}
      </View>
    </View>
  );

  const AddToPlanButton = () => (
    <TouchableOpacity onPress={() => onAddToPlan()}>
      <MaterialCommunityIcons name="calendar-plus" size={24} style={{ color: colors.primary }} />
    </TouchableOpacity>
  );

  const PlanInfo = () => (
    <View style={styles.planInfoContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons name="calendar" size={18} style={styles.planInfoDateIcon} />
        <Text style={styles.planInfoDateText}>{prettyMealSlot(mealSlot, mealDate)}</Text>
      </View>
    </View>
  );

  const editRecipe = () => {
    navigation.push(Routes.EditRecipe, { recipeId });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <>
        <ScrollView style={styles.viewContainer} contentContainerStyle={{ paddingBottom: 140 }}>
          <View style={{ flex: 1 }}>
            <HeaderButtons />
            <Title style={{ fontSize: 24, textAlign: 'center' }}>{recipe.name}</Title>
            {isPlannedMeal && (<PlanInfo />)}
            <MealRecipe />
            {!isPlannedMeal && (<MealTags />)}
            <MealIngredients />
          </View>
        </ScrollView>
        <FAB
          style={styles.fab}
          icon="pencil-outline"
          onPress={() => editRecipe()}
        />
      </>
    </SafeAreaView>
  );
}
