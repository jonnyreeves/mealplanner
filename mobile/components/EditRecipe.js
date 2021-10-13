import React, { useContext, useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  Provider, Title, Button, Text, Subheading, FAB, Chip, TextInput, Portal, Modal, IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';

import { kebab } from './helpers/kebab';
import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { ChipList } from './helpers/chips';

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

  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [newTagTextEntry, setNewTagTextEntry] = useState('');

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
      result.ingredientValues = ingredientValues;
    }
    return result;
  };

  const onNewTag = (newTag) => {
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setNewTagTextEntry('');
  };

  useEffect(() => {
    setNewTagTextEntry('');
  }, [tagModalVisible]);

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
    navigation.goBack();
  };

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  const IngredientsCard = () => {
    const onDeleteIngredient = (ingredientValue) => {
      setIngredientValues(ingredientValues.filter((v) => v !== ingredientValue));
    };

    const onAddIngredient = () => {
      console.log('You want to add an ingredient');
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
      setTags(tags.filter((v) => v !== tagName));
    };

    const onAddTag = () => {
      setTagModalVisible(true);
    };

    return (
      <>
        <Subheading style={{ paddingTop: 10 }}>Tags</Subheading>
        <ChipList
          items={tags}
          onAdd={onAddTag}
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

  const addTagModal = (
    <Portal>
      <Modal visible={tagModalVisible} onDismiss={() => setTagModalVisible(false)} contentContainerStyle={styles.addTagModalContainer}>
        <View>
          <Title>Modify tags</Title>
          <ChipList
            containerStyle={{ paddingTop: 10, paddingBottom: 10, justifyContent: 'center' }}
            items={[...new Set([...appState.getAllTags(), ...tags])]}
            selectedItems={tags}
            onPress={(tag) => onNewTag(tag)}
          />
          <TextInput
            mode="flat"
            dense
            placeholder="Create new tag"
            value={newTagTextEntry}
            onChangeText={((text) => setNewTagTextEntry(text))}
            onSubmitEditing={() => onNewTag(newTagTextEntry)}
          />
        </View>
        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
          <Button style={{ paddingTop: 10 }} onPress={() => setTagModalVisible(false)}>Close</Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <Provider>
      <View style={styles.viewContainer}>
        {tagModalVisible && addTagModal}
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
