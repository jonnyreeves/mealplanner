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
import { IngredientEditor, SaveChangesDialog, SourceEditor, TagEditor, ThemedTextInput, TitleEditor, useUnsavedChangesDectector } from './widgets/RecipeEditor';

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
    console.log(`modState=${JSON.stringify(modState)}`);
    console.log(`source recipe=${JSON.stringify(r)}`);
    console.log(`modState=${JSON.stringify(result)}`);
    return result;
  };

  const changeDetector = (fields) => (Object.keys(computeModifiedFields(fields)).length > 0);

  const [saveChanges, saveEnabled] = useUnsavedChangesDectector({
    changeDetector,
    presistChanges: (fields) => appState.updateRecipe(recipeId, computeModifiedFields(fields)),
    onSaveComplete: () => navigation.navigate(Routes.ViewRecipe, { recipeId }),
    navigationOptions: {
      title: 'Edit Recipe',
    },
  });

  useNavigationFocusListener(() => {
    const modState = sessionState.getRecipeModificationState();
    setTitle(modState.name);
    setSource(modState.source);
    setTags(modState.tags);
    setIngredients(modState.ingredients);
  });

  useEffect(() => {
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
  }, []);

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  return (
    <>
      <ScrollView style={styles.viewContainer} contentContainerStyle={{ paddingBottom: 120 }} overScrollMode="never">
        <View style={{ flex: 1 }}>
          <TitleEditor title={title} setTitle={setTitle} />
          <SourceEditor source={source} setSource={setSource} />
          <TagEditor tags={tags} setTags={setTags} />
          <IngredientEditor ingredients={ingredients} setIngredients={setIngredients} />
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
