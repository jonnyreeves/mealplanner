import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { Alert } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { theme } from '../../theme';
import { useAppState, useNavigationBeforeRemove, useSessionState } from '../helpers/navigation';
import { useSpinner } from './LoadingSpinner';
import { useNavigation } from '@react-navigation/core';
import { Routes } from '../../constants';

export const useUnsavedChangesDectector = ({ changeDetector, presistChanges, onSaveComplete }) => {
  const sessionState = useSessionState();
  const navigation = useNavigation();
  const showSpinner = useSpinner();

  const [saveEnabled, setSaveEnabled] = useState(false);
  useEffect(
    () => setSaveEnabled(hasChanges()),
    [sessionState.getRecipeModificationState()],
  );

  // Used to by-pass the logic which shows the 'changed detected' modal when the user
  // discards changes or once the changes have been persisted.
  let skipCheckRef = useRef(false);

  const hasChanges = () => changeDetector(sessionState.getRecipeModificationState());

  const discardChanges = () => {
    sessionState.clearRecipeModificationState();
    skipCheckRef.current = true;
    navigation.goBack();
  }

  const saveChanges = () => {
    if (!hasChanges()) {
      console.log('Cannot create recipe as no changed detected.');
      navigation.navigate(Routes.Browse);
    }
    const [hideSpinner] = showSpinner({ message: 'Saving recipe...' });
    presistChanges(sessionState.getRecipeModificationState())
      .then(() => {
        hideSpinner();
        sessionState.clearRecipeModificationState();

        console.log('setting skipCheck to true');
        skipCheckRef.current = true;

        onSaveComplete();
      }).catch((err) => {
        hideSpinner();
        Alert.alert(
          'Failed to save recipe',
          `Something went wrong trying to save your recipe: ${err.message}`
        );
      });
  }

  const showUnsavedChangesAlert = () => Alert.alert(
    'Unsaved Changes',
    'You have unsaved changes to this recipe, do you want to discard them?',
    [
      { text: 'Discard', style: 'destructive', onPress: () => discardChanges() },
      { text: 'Save changes', style: 'default', onPress: () => saveChanges() },
    ],
    {
      cancelable: true,
    },
  );

  // Re-wire the back button in the header to intercept presses.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => ((!skipCheckRef.current && hasChanges()) ? showUnsavedChangesAlert() : discardChanges())} />
      ),
    });
  }, [navigation]);

  // Intercept the 'beforeRemove' navigation event to intercept back gestures.
  useNavigationBeforeRemove((event) => {
    if (!skipCheckRef.current && hasChanges()) {
      event.preventDefault();
      showUnsavedChangesAlert();
    }
  });

  return [saveChanges, saveEnabled]
}

export const ThemedTextInput = ({ style, value, label, onChangeText }) => (
  <TextInput
    style={style}
    label={label}
    mode="outlined"
    theme={{ ...theme, roundness: 8 }}
    value={value}
    onChangeText={onChangeText}
    multiline
    numberOfLines={1}
    blurOnSubmit
  />
);