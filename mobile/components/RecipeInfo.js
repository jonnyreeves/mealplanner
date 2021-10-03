import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  Provider, Appbar, Title, Button, Text, Subheading,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  viewContainer: {
    padding: 20,
  },
});

export default function RecipeInfo({ route, showNav = true }) {
  const { recipe } = route.params;
  const navigation = useNavigation();

  const NavHeader = () => (
    <Appbar.Header>
      <Appbar.BackAction onPress={navigation.goBack} />
    </Appbar.Header>
  );

  const RecipeSourceCard = ({ source }) => {
    if (!source) return <></>;

    let recipeSrc = <Text>{source}</Text>;
    if (source.substr(0, 4) === 'http') {
      recipeSrc = (
        <Button onPress={() => Linking.openURL(source)}>
          Open Recipe
        </Button>
      );
    }

    return (
      <>
        <Subheading>Recipe</Subheading>
        {recipeSrc}
      </>
    );
  };

  const IngredientsCard = () => (
    <>
      <Subheading style={{ paddingTop: 10 }}>Ingredients</Subheading>
      <Text>{recipe.ingredients.map((ing) => ing.name).join(', ')}</Text>
    </>
  );

  console.log(recipe);
  return (
    <Provider>
      {showNav && <NavHeader />}
      <View style={styles.viewContainer}>
        <Title>{recipe.name}</Title>
        <RecipeSourceCard source={recipe.recipe} />
        <IngredientsCard />
      </View>
    </Provider>
  );
}
