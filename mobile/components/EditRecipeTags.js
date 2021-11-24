import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Provider, Title, Button, Text, Subheading, FAB, Chip, TextInput, Portal, Modal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { ChipList } from './helpers/chips';
import { useAppState, useNavigationFocusListener, useSessionState } from './helpers/navigation';

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

  const onNewTag = (newTag) => {
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
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
    <Provider>
      <View style={styles.viewContainer}>
        <Title>{sessionState.getRecipeModificationState()?.title}</Title>
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
