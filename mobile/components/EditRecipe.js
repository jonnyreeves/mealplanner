import React, { useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import {
  Provider, Subheading, FAB, Chip, TextInput, Portal, Modal, IconButton, Dialog, Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { kebab } from './helpers/kebab';
import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { ChipList } from './helpers/chips';
import { Routes } from '../constants';
import { useNavigationFocusListener } from './helpers/navigation';
import { IngredientsTable } from './widgets/Table';
import deepEqual from 'deep-equal';

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
  const appState = useContext(AppStateCtx);

  const [recipe, setRecipe] = useState(null);
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [saveChangesDialogVisible, setSaveChangesDialogVisible] = useState(false);

  const computeModifiedFields = () => {
    const result = {};
    const r = appState.getRecipeById(recipeId);
    const modState = appState.getRecipeModificationState();
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

  useNavigationFocusListener(navigation, React.useCallback(() => {
    const modState = appState.getRecipeModificationState();
    console.log('applying modification state', modState);
    if (modState?.tags) {
      setTags(modState.tags);
    }
    if (modState?.ingredients) {
      setIngredients(modState.ingredients);
    }
  }, [appState.getRecipeModificationState()]));

  useEffect(React.useCallback(() => {
    const r = appState.getRecipeById(recipeId);
    if (r) {
      setRecipe(r);
      setTitle(r.name);
      setSource(r.source);
      setTags(r.tags);
      setIngredients(r.ingredients);
    }
    navigation.addListener('beforeRemove', (e) => onBeforeRemove(e));
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
    appState.updateRecipeModificationState({ title: text });
    setTitle(text);
  };

  const onSourceChanged = (text) => {
    appState.updateRecipeModificationState({ source: text });
    setSource(text);
  };

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  const IngredientsCard = () => {
    const onDeleteIngredient = (ingredientValue) => {
      console.log(`delete: ${ingredientValue}`);
      const newIngredients = ingredients.filter((ing) => ing.value !== ingredientValue);
      console.log(newIngredients);
      appState.updateRecipeModificationState({ ingredients: newIngredients });
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
      appState.updateRecipeModificationState({ tags: newTags });
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
    appState.clearRecipeModificationState();
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
