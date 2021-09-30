import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Title, Text, Subheading } from 'react-native-paper';
import { MealPlanServiceCtx } from '../service/context';
import { RecipeSearch } from './widgets/RecipeSearch';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    marginTop: 50,
  },
  resultsContainer: {
    position: 'absolute',
    marginTop: 100,
  },
});

export default function Recipes() {
  const mealPlanService = useContext(MealPlanServiceCtx);
  const [recipes, setRecipes] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    mealPlanService.getRecipes()
      .then((data) => {
        setRecipes(data);
      });
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
    <View style={styles.viewContainer}>
      <Title>Recipe Search</Title>
      <RecipeSearch recipes={recipes} onSelect={setSelectedRecipe} />
      <View style={styles.resultsContainer}>
        {selectedRecipe && <RecipeInfo recipe={selectedRecipe} />}
      </View>
    </View>
  );
}
