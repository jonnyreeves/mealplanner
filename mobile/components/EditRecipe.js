import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Subheading, FAB, TextInput, Portal, Dialog, Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import deepEqual from 'deep-equal';

import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { ChipList } from './helpers/chips';
import { Routes } from '../constants';
import { useAppState, useNavigationFocusListener, useSessionState } from './helpers/navigation';
import { IngredientsTable } from './widgets/Table';
import { SaveChangesDialog, ThemedTextInput, useUnsavedChangesDectector } from './widgets/RecipeEditor';

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

export default function EditRecipe({ route }) {
  const { recipeId } = route.params;

  const navigation = useNavigation();
  const appState = useAppState();
  const sessionState = useSessionState();

  const [recipe, setRecipe] = useState(null);
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const computeModifiedFields = (modState) => {
    const result = {};
    const r = appState.getRecipeById(recipeId);
    if (!r) {
      return result;
    }
    if ('name' in modState && r.name !== modState.name) {
      result.name = modState.name;
    }
    if ('source' in modState && r.source !== modState.source) {
      result.source = modState.source;
    }
    if ('tags' in modState && !deepEqual(modState.tags, r.tags)) {
      result.tags = tags;
    }
    if ('ingredients' in modState && !deepEqual(modState.ingredients, r.ingredients)) {
      result.ingredients = modState.ingredients;
    }
    return result;
  };

  const changeDetector = (fields) => (Object.keys(computeModifiedFields(fields)).length > 0);

  const [saveChanges, saveEnabled] = useUnsavedChangesDectector({
    changeDetector,
    presistChanges: (fields) => appState.updateRecipe(recipeId, computeModifiedFields(fields)),
    onSaveComplete: () => navigation.navigate(Routes.ViewRecipe, { recipeId }),
  });

  useNavigationFocusListener(() => {
    const modState = sessionState.getRecipeModificationState();
    if (modState) {
      setTitle(modState.name);
      setSource(modState.source);
      setTags(modState.tags);
      setIngredients(modState.ingredients);
    }
  });

  useEffect(React.useCallback(() => {
    const r = appState.getRecipeById(recipeId);
    if (r) {
      setRecipe(r);
      sessionState.updateRecipeModificationState({
        name: r.name,
        source: r.source,
        tags: r.tags,
        ingredients: r.ingredients,
      });
    }
  }), []);

  const onTitleChanged = (text) => {
    sessionState.updateRecipeModificationState({ name: text });
    setTitle(text);
  };

  const onSourceChanged = (text) => {
    sessionState.updateRecipeModificationState({ source: text });
    setSource(text);
  };

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  const IngredientsCard = () => {
    const onDeleteIngredient = (ingredientValue) => {
      console.log(`delete: ${ingredientValue}`);
      const newIngredients = ingredients.filter((ing) => ing.value !== ingredientValue);
      console.log(newIngredients);
      sessionState.updateRecipeModificationState({ ingredients: newIngredients });
      setIngredients(newIngredients);
    };

    const onAddIngredient = () => {
      navigation.push(Routes.EditRecipeIngredients, { recipeId });
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
      navigation.push(Routes.EditRecipeTags, { recipeId });
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
        style={styles.fab}
        disabled={!saveEnabled}
        icon="content-save"
        onPress={() => saveChanges()}
      />
    </>
  );
}
