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
import { IngredientEditor, SourceEditor, TagEditor, ThemedTextInput, TitleEditor, useUnsavedChangesDectector } from './widgets/RecipeEditor';

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
    navigationOptions: {
      title: 'Create Recipe',
    },
  });

  useNavigationFocusListener(() => {
    const modState = sessionState.getRecipeModificationState();
    setTags(modState.tags);
    setIngredients(modState.ingredients);
  });

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
        disabled={!saveEnabled}
        style={styles.fab}
        icon="content-save"
        onPress={() => saveChanges()}
      />
    </>
  );
}
