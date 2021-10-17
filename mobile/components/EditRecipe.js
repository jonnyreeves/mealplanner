import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppState, Keyboard, KeyboardAvoidingView, Linking, StyleSheet, View } from 'react-native';
import {
  Provider, Title, Button, Text, Subheading, FAB, Chip, TextInput, Portal, Modal, IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { kebab } from './helpers/kebab';
import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { ChipList } from './helpers/chips';
import { Routes } from '../constants';
import { useNavigationFocusListener } from './helpers/navigation';

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
});

export default function EditRecipe({ route }) {
  const { recipeId } = route.params;

  const navigation = useNavigation();
  const appState = useContext(AppStateCtx);

  const [recipe, setRecipe] = useState(null);

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState([]);
  const [ingredientValues, setIngredientValues] = useState([]);

  const computeModifiedFields = () => {
    const result = {};
    if (recipe.name !== title) {
      result.name = title;
    }
    if (recipe.source !== source) {
      result.source = source;
    }
    if (recipe.tags.toString() !== tags.toString()) {
      result.tags = tags;
    }
    if (recipe.ingredients.map((v) => v.value).toString() !== ingredientValues.toString()) {
      result.ingredients = ingredientValues;
    }
    return result;
  };

  useNavigationFocusListener(navigation, React.useCallback(() => {
    const modState = appState.getRecipeModificationState();
    console.log('applying modification state', modState);
    if (modState?.tags) {
      setTags(modState.tags);
    }
    if (modState?.ingredientValues) {
      setIngredientValues(modState.ingredientValues);
    }
  }, [appState.getRecipeModificationState()]));

  useEffect(React.useCallback(() => {
    const r = appState.getRecipeById(recipeId);
    if (r) {
      setRecipe(r);
      setTitle(r.name);
      setSource(r.source);
      setTags(r.tags);
      setIngredientValues(r.ingredients.map((ing) => ing.value));
    }
  }), []);

  const onSave = () => {
    const modifiedFields = computeModifiedFields();
    if (Object.keys(modifiedFields).length > 0) {
      console.log(modifiedFields);
      appState.updateRecipe(recipe.id, modifiedFields);
    }
    navigation.popToTop();
  };

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  const IngredientsCard = () => {
    const onDeleteIngredient = (ingredientValue) => {
      const newIngredientValues = ingredientValues.filter((v) => v !== ingredientValue);
      appState.updateRecipeModificationState({ ingredientValues: newIngredientValues });
      setIngredientValues(newIngredientValues);
    };

    const onAddIngredient = () => {
      navigation.push(Routes.EditRecipeIngredients, { recipeId });
    };

    return (
      <>
        <Subheading style={{ paddingTop: 10 }}>Ingredients</Subheading>
        <ChipList
          items={ingredientValues}
          onClose={onDeleteIngredient}
          onAdd={onAddIngredient}
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
        <Subheading style={{ paddingTop: 10 }}>Tags</Subheading>
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
      <TextInput style={{ marginBottom: 10 }} label="Recipe Name" mode="flat" value={title} onChangeText={(text) => setTitle(text)} />
    </>
  );

  const sourceCard = (
    <>
      <TextInput label="Recipe Source" mode="flat" value={source} onChangeText={(text) => setSource(text)} />
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
        <FAB
          style={styles.fab}
          icon="content-save"
          onPress={() => onSave()}
        />
      </View>
    </Provider>
  );
}
