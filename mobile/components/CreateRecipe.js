import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Subheading, FAB, TextInput, Portal, Dialog, Button, ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { ChipList } from './helpers/chips';
import { Routes } from '../constants';
import { useSessionState, useNavigationFocusListener, useNavigationBeforeRemove, useAppState } from './helpers/navigation';
import { IngredientsTable } from './widgets/Table';
import { ThemedTextInput, useUnsavedChangesDectector } from './widgets/RecipeEditor';

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
  addTagModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
  },
  subheadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center',
  },
});

export default function CreateRecipe() {
  const navigation = useNavigation();
  const appState = useAppState();
  const sessionState = useSessionState();

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const changeDetector = (modState) => Boolean(modState.name);

  const [saveChanges, saveEnabled] = useUnsavedChangesDectector({
    changeDetector,
    presistChanges: (fields) => appState.createRecipe(fields),
    onSaveComplete: () => navigation.navigate(Routes.Browse, { createdRecipeTitle: title }),
  });

  useNavigationFocusListener(() => {
    const modState = sessionState.getRecipeModificationState();
    setTags(modState.tags);
    setIngredients(modState.ingredients);
  });

  const onTitleChanged = (text) => {
    sessionState.updateRecipeModificationState({ name: text });
    setTitle(text);
  };

  const onSourceChanged = (text) => {
    sessionState.updateRecipeModificationState({ source: text });
    setSource(text);
  };

  const IngredientsCard = () => {
    const onDeleteIngredient = (ingredientValue) => {
      const newIngredients = ingredients.filter((ing) => ing.value !== ingredientValue);
      sessionState.updateRecipeModificationState({ ingredients: newIngredients });
      setIngredients(newIngredients);
    };

    const onAddIngredient = () => {
      navigation.push(Routes.EditRecipeIngredients);
    };

    return (
      <>
        <View style={styles.subheadingContainer}>
          <Subheading>Ingredients</Subheading>
          <Button compact icon="plus" onPress={() => onAddIngredient()}>Add Ingredient</Button>
        </View>
        <IngredientsTable
          ingredients={ingredients}
          onDelete={(ingredient) => onDeleteIngredient(ingredient.value)}
        />
      </>
    );
  };

  const TagsCard = () => {
    const onDeleteTag = (tagName) => {
      const newTags = tags.filter((v) => v !== tagName);
      sessionState.updateRecipeModificationState({ tags: newTags });
      setTags(newTags);
    };

    const onEditTags = () => {
      navigation.push(Routes.EditRecipeTags);
    };

    return (
      <>
        <View style={styles.subheadingContainer}>
          <Subheading>Tags</Subheading>
        </View>
        <ChipList
          items={tags}
          onAdd={onEditTags}
          onClose={onDeleteTag}
        />
      </>
    );
  };

  const titleCard = (
    <ThemedTextInput
      style={{ marginBottom: 10 }}
      value={title}
      label="Recipe Name"
      onChangeText={(text) => onTitleChanged(text)}
    />
  );

  const sourceCard = (
    <ThemedTextInput
      label="Recipe Source"
      value={source}
      onChangeText={(text) => onSourceChanged(text)}
    />
  );

  return (
    <>
      <ScrollView style={styles.viewContainer} contentContainerStyle={{ paddingBottom: 120 }} overScrollMode="never">
        <View style={{ flex: 1 }}>
          {titleCard}
          {sourceCard}
          <TagsCard />
          <IngredientsCard />
        </View>
      </ScrollView>
      <FAB
        disabled={!saveEnabled}
        style={styles.fab}
        icon="content-save"
        onPress={() => saveChanges()}
      />
    </>
  );
}
