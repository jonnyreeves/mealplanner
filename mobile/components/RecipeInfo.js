import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  Provider, Title, Button, Text, Subheading, FAB, Chip, TextInput,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

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
  tagListContainer: {
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagListItem: {
    margin: 3,
  },
});

export default function RecipeInfo({ route }) {
  const { recipe } = route.params;
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const toggleEditingMode = () => setIsEditing(!isEditing);

  const [title, setTitle] = useState('');
  const [recipeSrc, setRecipeSrc] = useState('');

  useEffect(() => {
    setTitle(recipe.name);
    setRecipeSrc(recipe.recipe);
  }, []);

  useEffect(() => {
    navigation.setOptions({ headerTitle: isEditing ? 'Edit Recipe' : 'Recipe Details' });
  }, [isEditing]);

  const onAddToPlan = () => {
    navigation.push('Home', { screen: 'Plan', params: { action: 'add', recipe } });
  };

  const IngredientsCard = () => (
    <>
      <Subheading style={{ paddingTop: 10 }}>Ingredients</Subheading>
      <ChipList items={recipe.ingredients.map((ing) => ing.value)} />
    </>
  );

  const ChipList = ({ items }) => {
    const chips = items.map((item) => (
      <Chip
        style={styles.tagListItem}
        onClose={isEditing ? () => console.log('you clicked close') : null}
        mode="outlined"
        key={kebab(item)}
      >
        {item}
      </Chip>
    ));
    if (isEditing) {
      chips.push(<Chip style={styles.tagListItem} icon="plus" mode="outlined" key="add">Add</Chip>);
    }
    return <View style={styles.tagListContainer}>{chips}</View>;
  };

  const TagsCard = () => (
    <>
      <Subheading style={{ paddingTop: 10 }}>Tags</Subheading>
      <ChipList items={recipe.tags} />
    </>
  );

  const titleCard = (
    <>
      {!isEditing && <Title>{recipe.name}</Title>}
      {isEditing && <TextInput style={{ marginBottom: 10 }} label="Recipe Name" mode="flat" value={title} onChangeText={(text) => setTitle(text)} />}
    </>
  );

  const sourceCard = (
    <>
      {isEditing && <TextInput label="Recipe Source" mode="flat" value={recipeSrc} onChangeText={(text) => setRecipeSrc(text)} />}
      {!isEditing && recipeSrc.substr(0, 4) === 'http' && (
        <Button compact onPress={() => Linking.openURL(recipeSrc)}>
          Open Recipe
        </Button>
      )}
      {!isEditing && recipeSrc.substr(0, 4) !== 'http' && <Text>{recipeSrc || 'No recipe'}</Text>}
    </>
  );

  return (
    <Provider>
      <View style={styles.viewContainer}>
        <View style={{ flex: 1 }}>
          {titleCard}
          {sourceCard}
          <IngredientsCard />
          <TagsCard />
        </View>
        {!isEditing && <Button onPress={() => onAddToPlan()} mode="outlined" style={{ marginBottom: 40 }}>Add to Plan</Button>}
        <FAB
          style={styles.fab}
          icon={isEditing ? 'content-save' : 'pencil-outline'}
          onPress={() => toggleEditingMode()}
        />
      </View>
    </Provider>
  );
}
