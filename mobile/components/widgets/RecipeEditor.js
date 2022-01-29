import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { Button, Subheading } from 'react-native-paper';
import { Alert, View } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/core';
import { useNavigationBeforeRemove } from '../helpers/navigation';
import { useSpinner } from './modals';
import { Routes } from '../../constants';
import { ChipList } from './chips';
import { IngredientsTable } from './tables';
import { useSessionState } from '../../service/context';
import { ThemedTextInput } from './input';
import { alphabetically } from '../helpers/ingredientList';

export const useUnsavedChangesDectector = ({
  changeDetector, presistChanges, onSaveComplete, navigationOptions,
}) => {
  const sessionState = useSessionState();
  const navigation = useNavigation();
  const showSpinner = useSpinner();

  const [saveEnabled, setSaveEnabled] = useState(false);

  const hasChanges = useCallback(
    () => {
      const result = changeDetector(sessionState.getRecipeModificationState());
      console.log(`checking for change, hasChanges=${result}`);
      return result;
    },
    [sessionState.getRecipeModificationState()],
  );

  useEffect(
    () => {
      console.log('useEffect for saveEnabled...');
      setSaveEnabled(hasChanges());
    },
    [sessionState.getRecipeModificationState()],
  );

  // Used to by-pass the logic which shows the 'changed detected' modal when the user
  // discards changes or once the changes have been persisted.
  const skipCheckRef = useRef(false);

  const discardChanges = () => {
    sessionState.clearRecipeModificationState();
    skipCheckRef.current = true;
    navigation.goBack();
  };

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
          `Something went wrong trying to save your recipe: ${err.message}`,
        );
      });
  };

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
      ...navigationOptions,
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

  return [saveChanges, saveEnabled];
};

export const TitleEditor = ({ title, setTitle }) => {
  const sessionState = useSessionState();
  const onTitleChanged = (text) => {
    sessionState.updateRecipeModificationState({ name: text });
    setTitle(text);
  };
  return (
    <ThemedTextInput
      style={{ marginBottom: 10 }}
      value={title}
      label="Recipe Name"
      multiline
      onChangeText={onTitleChanged}
    />
  );
};

export const SourceEditor = ({ source, setSource }) => {
  const sessionState = useSessionState();
  const onSourceChanged = (text) => {
    sessionState.updateRecipeModificationState({ source: text });
    setSource(text);
  };
  return (
    <ThemedTextInput
      label="Recipe Source"
      value={source}
      multiline
      onChangeText={onSourceChanged}
    />
  );
};

const subheadingContainerStyle = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
  alignItems: 'center',
};

export const TagEditor = ({ tags, setTags }) => {
  const navigation = useNavigation();
  const sessionState = useSessionState();

  const onDeleteTag = (tagName) => {
    const newTags = tags.filter((v) => v !== tagName);
    sessionState.updateRecipeModificationState({ tags: newTags });
    setTags(newTags);
  };

  const onEditTags = () => navigation.push(Routes.EditRecipeTags);

  return (
    <>
      <View style={subheadingContainerStyle}>
        <Subheading>Tags</Subheading>
        <Button compact icon="plus" onPress={() => onEditTags()}>Add Tags</Button>
      </View>
      <ChipList
        items={tags}
        onClose={onDeleteTag}
      />
    </>
  );
};

export const IngredientEditor = ({ ingredients, setIngredients }) => {
  const sessionState = useSessionState();
  const navigation = useNavigation();

  const onDeleteIngredient = (ingredientValue) => {
    const newIngredients = ingredients.filter((ing) => ing.value !== ingredientValue);
    sessionState.updateRecipeModificationState({ ingredients: newIngredients });
    setIngredients(newIngredients);
  };

  const onPressIngredient = (ingredient) => {
    console.log(ingredient);
    navigation.push(Routes.EditRecipeIngredients, { ingredientName: ingredient.name });
  };

  const onAddIngredient = () => navigation.push(Routes.EditRecipeIngredients);

  return (
    <>
      <View style={subheadingContainerStyle}>
        <Subheading>Ingredients</Subheading>
        <Button compact icon="plus" onPress={() => onAddIngredient()}>Add Ingredient</Button>
      </View>
      <IngredientsTable
        ingredients={ingredients}
        onPress={(ingredient) => onPressIngredient(ingredient)}
        onDelete={(ingredient) => onDeleteIngredient(ingredient.value)}
      />
    </>
  );
};
