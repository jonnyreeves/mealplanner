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
  const [saveChangesDialogVisible, setSaveChangesDialogVisible] = useState(false);

  const computeModifiedFields = () => {
    const result = {};
    const r = appState.getRecipeById(recipeId);
    const modState = sessionState.getRecipeModificationState();
    if (!r) {
      return result;
    }
    if ('title' in modState && r.name !== modState.title) {
      result.name = modState.title;
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

  const onBeforeRemove = (event) => {
    if (Object.keys(computeModifiedFields()).length > 0) {
      event.preventDefault();
      setSaveChangesDialogVisible(true);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => onBeforeRemove(e));
    return () => unsub();
  }, [navigation]);

  useNavigationFocusListener(React.useCallback(() => {
    const modState = sessionState.getRecipeModificationState();
    if (modState) {
      setTitle(modState.title);
      setSource(modState.source);
      setTags(modState.tags);
      setIngredients(modState.ingredients);
    }
  }, [sessionState.getRecipeModificationState()]));

  useEffect(React.useCallback(() => {
    const r = appState.getRecipeById(recipeId);
    if (r) {
      setRecipe(r);
      sessionState.updateRecipeModificationState({
        title: r.name,
        source: r.source,
        tags: r.tags,
        ingredients: r.ingredients,
      });
    }
  }), []);

  const onSave = () => {
    const modifiedFields = computeModifiedFields();
    if (Object.keys(modifiedFields).length > 0) {
      console.log(modifiedFields);
      appState.updateRecipe(recipe.id, modifiedFields);
    }
    navigation.navigate(Routes.ViewRecipe, { recipeId });
  };

  const onTitleChanged = (text) => {
    sessionState.updateRecipeModificationState({ title: text });
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
    <>
      <TextInput
        style={{ marginBottom: 10 }}
        label="Recipe Name"
        mode="flat"
        value={title}
        onChangeText={(text) => onTitleChanged(text)}
        multiline
        blurOnSubmit
      />
    </>
  );

  const sourceCard = (
    <>
      <TextInput
        label="Recipe Source"
        mode="flat"
        value={source}
        onChangeText={(text) => onSourceChanged(text)}
        multiline
        blurOnSubmit
      />
    </>
  );

  const hideSaveChangesDialog = () => setSaveChangesDialogVisible(false);
  const saveChanges = () => onSave();
  const cancelChanges = () => {
    sessionState.clearRecipeModificationState();
    navigation.navigate(Routes.ViewRecipe, { recipeId });
  };

  return (
    <>
      <Portal>
        <Dialog visible={saveChangesDialogVisible} onDismiss={hideSaveChangesDialog}>
          <Dialog.Title>Save Changes?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => cancelChanges()}>Cancel</Button>
            <Button onPress={() => saveChanges()}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
        icon="content-save"
        onPress={() => onSave()}
      />
    </>
  );
}
