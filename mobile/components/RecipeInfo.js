import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  Provider, Appbar, Title, Button, Text, Subheading,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
});

export default function RecipeInfo({ route }) {
  const { recipe } = route.params;
  const navigation = useNavigation();

  const onAddToPlan = () => {
    navigation.push('Home', { screen: 'Plan', params: { action: 'add', recipe } });
  };


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

  const TagsCard = () => (
    <>
      <Subheading style={{ paddingTop: 10 }}>Tags</Subheading>
      <Text>{recipe.tags.join(', ')}</Text>
    </>
  );

  return (
    <Provider>
      <View style={styles.viewContainer}>
        <View style={{ flex: 1 }}>
          <Title>{recipe.name}</Title>
          <RecipeSourceCard source={recipe.recipe} />
          <IngredientsCard />
          <TagsCard />
        </View>
        <Button onPress={() => onAddToPlan()} mode="outlined" style={{ marginBottom: 40 }}>Add to Plan</Button>
      </View>
    </Provider>
  );
}
