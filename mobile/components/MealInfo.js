import React from 'react';
import { Linking } from 'react-native';
import {
  Provider, Appbar, Title, Button, Text,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function MealInfo({ route, showNav = true }) {
  const { meal } = route.params;
  const navigation = useNavigation();

  const NavHeader = () => {
    return (
      <Appbar.Header>
        <Appbar.BackAction onPress={navigation.goBack} />
      </Appbar.Header>
    );
  };

  const RecipeCard = ({ recipe }) => {
    console.log(recipe);
    if (!recipe) return <></>;
    if (recipe.substr(0, 4) === 'http') {
      return (
        <Button mode="outlined" onPress={() => Linking.openURL(recipe)}>
          Open Recipe
        </Button>
      );
    }
    return <Text>{recipe}</Text>;
  };

  return (
    <Provider>
      {showNav && <NavHeader />}
      <Title>{meal.name}</Title>
      <RecipeCard recipe={meal.recipe} />
    </Provider>
  );
}
