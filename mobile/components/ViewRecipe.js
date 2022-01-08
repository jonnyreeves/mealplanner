import React, { useContext, useEffect, useState } from 'react';
import { Linking, StyleSheet, View, ScrollView } from 'react-native';
import {
  Provider, Title, Button, Text, Subheading, FAB, Chip, TextInput,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';

import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/modals';
import { ChipList } from './widgets/chips';
import { Routes } from '../constants';
import { IngredientsTable, Table } from './widgets/Table';
import { kebab } from './helpers/kebab';

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
});

export default function ViewRecipe({ route }) {
  const { recipeId, showAddButton } = route.params;

  const navigation = useNavigation();
  const appState = useContext(AppStateCtx);

  const [recipe, setRecipe] = useState(null);

  useFocusEffect(React.useCallback(() => {
    setRecipe(appState.getRecipeById(recipeId));
  }));

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  const onAddToPlan = () => {
    navigation.push('AddRecipeToPlan', { recipe });
  };

  const IngredientsCard = () => (
    <>
      <Subheading style={{ paddingTop: 10 }}>Ingredients</Subheading>
      <IngredientsTable ingredients={recipe.ingredients} />
    </>
  );

  const TagsCard = () => (
    <>
      <Subheading style={{ paddingTop: 10 }}>Tags</Subheading>
      <ChipList items={recipe.tags} />
    </>
  );

  const titleCard = (
    <>
      <Title>{recipe.name}</Title>
    </>
  );

  const isHttpLink = recipe.source?.substr(0, 4) === 'http';
  const sourceCard = (
    <>
      {isHttpLink && (
        <Button compact onPress={() => Linking.openURL(recipe.source)}>
          Open Recipe
        </Button>
      )}
      {!isHttpLink && <Text>{recipe.source || 'No recipe'}</Text>}
    </>
  );

  const addToPlanButton = <Button onPress={() => onAddToPlan()} mode="outlined" style={styles.addToPlanBtn}>Add to Plan</Button>;

  const editRecipe = () => {
    navigation.push(Routes.EditRecipe, { recipeId });
  };

  return (
    <>
      <ScrollView style={styles.viewContainer} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ flex: 1 }}>
          {titleCard}
          {sourceCard}
          <TagsCard />
          <IngredientsCard />
        </View>
        {showAddButton && addToPlanButton}
      </ScrollView>
      <FAB
        style={styles.fab}
        icon="pencil-outline"
        onPress={() => editRecipe()}
      />
    </>
  );
}
