import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Title, Text, Subheading } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AutoComplete from 'react-native-autocomplete-input';
import * as kebabCase from 'kebab-case';
import { MealPlanServiceCtx } from '../service/context';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    position: 'relative',
    paddingTop: 50,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    padding: 5,
  },
  itemText: {
    fontSize: 15,
    margin: 2,
    color: 'black',
  },
  resultsContainer: {
    marginTop: 40,
  },
});

export default function Recipes() {
  const mealPlanService = useContext(MealPlanServiceCtx);
  const [recipes, setRecipes] = useState(null);
  const [query, setQuery] = useState('');

  const queryRecipes = (searchTerm) => {
    if (!recipes?.length || searchTerm.trim().length < 3) {
      return [];
    }
    const re = new RegExp(`${searchTerm.trim()}`, 'i');
    return recipes.filter((recipe) => recipe.name.search(re) >= 0);
  };

  const queriedRecipes = queryRecipes(query);
  const hasExactRecipe = queriedRecipes?.length === 1 && queriedRecipes[0].name.toLowerCase() === query.toLowerCase().trim();
  const isLoading = !recipes?.length;
  const placeholder = (isLoading) ? 'Loading data...' : 'Enter recipe name';

  useEffect(() => {
    mealPlanService.getRecipes()
      .then((data) => setRecipes(data));
  }, []);

  const RecipeInfo = ({ recipe }) => (
    <>
      <Title>{recipe.name}</Title>
      <Subheading>Recipe</Subheading>
      <Text>{recipe.recipe}</Text>
      <Subheading>Ingredients</Subheading>
      <Text>{recipe.ingredients.map((i) => i.name).join(', ')}</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.viewContainer}>
      <View style={styles.autocompleteContainer}>
        <Title>Recipe Search</Title>
        <AutoComplete
          editable={!isLoading}
          autoCorrect={false}
          data={
            hasExactRecipe
              ? [] // Close suggestion list in case recipe matches query
              : queriedRecipes
          }
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          flatListProps={{
            keyboardShouldPersistTaps: 'always',
            keyExtractor: (recipe) => kebabCase(recipe.name),
            renderItem: ({ item: { name } }) => (
              <TouchableOpacity onPress={() => setQuery(name)}>
                <Text style={styles.itemText}>{name}</Text>
              </TouchableOpacity>
            ),
          }}
        />
      </View>
      <View style={styles.resultsContainer}>
        {hasExactRecipe && <RecipeInfo recipe={queriedRecipes[0]} />}
      </View>
    </SafeAreaView>
  );
}
