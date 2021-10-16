import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Provider, Title, Button, Text, Subheading, FAB, Chip, TextInput, Portal, Modal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { kebab } from './helpers/kebab';
import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { ChipList } from './helpers/chips';
import { useNavigationFocusListener } from './helpers/navigation';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
});

export default function EditRecipeTags({ route }) {
  const { recipeId } = route.params;

  const navigation = useNavigation();
  const appState = useContext(AppStateCtx);

  const [recipe, setRecipe] = useState(null);

  const [newTagTextEntry, setNewTagTextEntry] = useState('');
  const [tags, setTags] = useState([]);

  const onNewTag = (newTag) => {
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setNewTagTextEntry('');
  };

  useEffect(React.useCallback(() => {
    const r = appState.getRecipeById(recipeId);
    if (r) {
      setRecipe(r);
      setTags(r.tags);
    }
  }), []);

  useNavigationFocusListener(navigation, () => {
    const modState = appState.getRecipeModificationState();
    if (modState?.tags) {
      setTags(modState.tags);
    }
  });

  const onSave = () => {
    appState.updateRecipeModificationState({ tags });
    navigation.goBack();
  };

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  return (
    <Provider>
      <View style={styles.viewContainer}>
        <Title>{recipe.name}</Title>
        <ChipList
          containerStyle={{ paddingTop: 10, paddingBottom: 10, justifyContent: 'center' }}
          items={[...new Set([...appState.getAllTags(), ...tags])]}
          selectedItems={tags}
          onPress={(tag) => {
            if (tags.includes(tag)) {
              setTags([...tags.filter((t) => t !== tag)]);
            } else {
              onNewTag(tag);
            }
          }}
        />
        <TextInput
          mode="flat"
          dense
          placeholder="Create new tag"
          value={newTagTextEntry}
          onChangeText={((text) => setNewTagTextEntry(text))}
          onSubmitEditing={() => onNewTag(newTagTextEntry)}
        />

        <Button compact style={{ paddingTop: 30 }} onPress={() => onSave()}>Save</Button>
      </View>
    </Provider>
  );
}
