import React, {
  useLayoutEffect, useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Title, Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { ChipList } from './widgets/chips';
import { useAppState, useSessionState } from '../service/context';
import { ThemedTextInput } from './widgets/input';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
});

export default function EditRecipeTags() {
  const navigation = useNavigation();
  const appState = useAppState();
  const sessionState = useSessionState();

  const [newTagTextEntry, setNewTagTextEntry] = useState('');
  const [tags, setTags] = useState([]);

  const modifyTags = (newTags) => {
    sessionState.updateRecipeModificationState({ tags: newTags });
    setTags(newTags);
  };

  const onCreateNewTag = (newTag) => {
    console.log(' create new tag ');
    if (!tags.includes(newTag)) {
      modifyTags([...tags, newTag]);
    }
    setNewTagTextEntry('');
  };

  useLayoutEffect(() => {
    const modState = sessionState.getRecipeModificationState();
    if (modState) {
      setTags(modState.tags || []);
    }
  }, [sessionState.getRecipeModificationState()]);

  const onSave = () => {
    sessionState.updateRecipeModificationState({ tags });
    navigation.goBack();
  };

  return (
    <View style={styles.viewContainer}>
      <Title>{sessionState.getRecipeModificationState()?.name}</Title>

      <ChipList
        containerStyle={{ marginTop: 10, marginBottom: 10, justifyContent: 'center' }}
        items={[...new Set([...appState.getAllTags(), ...tags])]}
        selectedItems={tags}
        onPress={(tag) => {
          if (tags.includes(tag)) {
            modifyTags([...tags.filter((t) => t !== tag)]);
          } else {
            onCreateNewTag(tag);
          }
        }}
      />
      <ThemedTextInput
        placeholder="Create new tag"
        value={newTagTextEntry}
        onChangeText={setNewTagTextEntry}
        onSubmitEditing={() => onCreateNewTag(newTagTextEntry)}
      />

      <Button compact style={{ paddingTop: 30 }} onPress={() => onSave()}>Save</Button>
    </View>
  );
}
