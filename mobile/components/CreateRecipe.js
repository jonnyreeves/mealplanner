import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Subheading, FAB, TextInput, Portal, Dialog, Button, ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import deepEqual from 'deep-equal';

import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { ChipList } from './helpers/chips';
import { Routes } from '../constants';
import { useNavigationFocusListener } from './helpers/navigation';
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

export default function CreateRecipe() {
  const navigation = useNavigation();
  const appState = useContext(AppStateCtx);

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [saveEnabled, setSaveEnabled] = useState(false);
  const [showSavingSpinner, setShowSavingSpinner] = useState(false);
  const [saveChangesDialogVisible, setSaveChangesDialogVisible] = useState(false);

  const hasChanges = () => !!appState.getRecipeModificationState()?.title;

  const onBeforeRemove = (event) => {
    if (hasChanges()) {
      event.preventDefault();
      setSaveChangesDialogVisible(true);
    }
  };

  useNavigationFocusListener(navigation, React.useCallback(() => {
    const modState = appState.getRecipeModificationState();
    if (modState?.tags) {
      setTags(modState.tags);
    }
    if (modState?.ingredients) {
      setIngredients(modState.ingredients);
    }
  }, [appState.getRecipeModificationState()]));

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => onBeforeRemove(e));
  }, [navigation]);

  useEffect(() => {
    setSaveEnabled(hasChanges());
  }, [appState.getRecipeModificationState()]);

  const onSave = async () => {
    if (!hasChanges()) {
      console.log('Cannot create recipe as no changed detected');
      navigation.navigate(Routes.Browse);
    }
    setShowSavingSpinner(true);
    await appState.createRecipe({
      name: title,
      source,
      tags,
      ingredients,
    });
    navigation.navigate(Routes.Browse, { createdRecipeTitle: title });
  };

  const onTitleChanged = (text) => {
    appState.updateRecipeModificationState({ title: text });
    setTitle(text);
  };

  const onSourceChanged = (text) => {
    appState.updateRecipeModificationState({ source: text });
    setSource(text);
  };

  const IngredientsCard = () => {
    const onDeleteIngredient = (ingredientValue) => {
      const newIngredients = ingredients.filter((ing) => ing.value !== ingredientValue);
      appState.updateRecipeModificationState({ ingredients: newIngredients });
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
      appState.updateRecipeModificationState({ tags: newTags });
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

  const saveChanges = () => {
    hideSaveChangesDialog();
    onSave();
  };

  const cancelChanges = () => {
    appState.clearRecipeModificationState();
    navigation.navigate(Routes.Browse);
  };

  return (
    <>
      <Portal>
        <Dialog visible={showSavingSpinner}>
          <Dialog.Title>Saving changes...</Dialog.Title>
          <ActivityIndicator size="large" style={{ paddingBottom: 30 }} />
        </Dialog>
      </Portal>
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
        disabled={!saveEnabled}
        style={styles.fab}
        icon="content-save"
        onPress={() => onSave()}
      />
    </>
  );
}
