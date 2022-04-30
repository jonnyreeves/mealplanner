import React, {
  useCallback, useEffect, useLayoutEffect, useState,
} from 'react';
import {
  BackHandler,
  FlatList, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import {
  Text, Title, Searchbar, Portal, Modal, Divider,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { kebab } from './helpers/kebab';
import { useAppState, useSessionState } from '../service/context';
import { ThemedTextInput } from './widgets/input';
import { alphabetically } from './helpers/ingredientList';
import { theme } from '../theme';

const { defaultStyles } = theme;

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
  searchbar: {
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    marginVertical: 8,
  },
  queryTooShortText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
  qtyModalStyle: {
    ...defaultStyles.modal,
  },
});

const MinSearchLength = 2;

export default function EditRecipeIngredients({ route }) {
  const navigation = useNavigation();
  const appState = useAppState();
  const sessionState = useSessionState();

  const ingNameParam = route.params?.ingredientName;
  console.log(ingNameParam);

  const [query, setQuery] = useState('');
  const [qtyModalVisible, setQtyModalVisible] = useState(false);

  const [allIngredients, setAllIngredients] = useState([]);
  const [newIngredientName, setNewIngredientName] = useState(ingNameParam || '');
  const [newIngredientQty, setNewIngredientQty] = useState('1');
  const [ingredientAdded, setIngredientAdded] = useState(false);

  const findRecipeIngredient = (ingredientName) => {
    const { ingredients } = sessionState.getRecipeModificationState();
    return ingredients.find((ing) => ing.name === ingredientName);
  };

  const onNewIngredientAdded = () => {
    let newValue = '';
    // eslint-disable-next-line eqeqeq
    if (parseInt(newIngredientQty, 10) == newIngredientQty) {
      newValue = `${newIngredientQty}x ${newIngredientName}`;
    } else {
      newValue = `${newIngredientQty} ${newIngredientName}`;
    }

    let { ingredients } = sessionState.getRecipeModificationState();
    let perfomUpdate = true;

    const newIngredient = {
      name: newIngredientName,
      quantity: newIngredientQty,
      value: newValue,
    };

    const existingIngredient = findRecipeIngredient(newIngredientName);
    if (existingIngredient) {
      if (existingIngredient.value === newValue) {
        perfomUpdate = false;
      } else {
        // Remove the previous ingredient entry so we can replace it with the new (updated) one.
        ingredients = ingredients.filter((ing) => ing.name !== newIngredientName);
      }
    }
    if (perfomUpdate) {
      sessionState.updateRecipeModificationState({ ingredients: [...ingredients, newIngredient] });
    }

    setNewIngredientName('');
    setNewIngredientQty('');
    setQtyModalVisible(false);

    // HACK: Setting this state will cause the app to navigate back from this screen on
    // the next render.
    setIngredientAdded(true);
  };

  // HACK: We need to dismiss the QtyModal before we navigate away otherwise we break
  // the backNavigation gesture.
  useEffect(() => {
    if (ingredientAdded) {
      navigation.goBack();
    }
  }, [ingredientAdded]);

  const searchIngredients = (source) => {
    const sanatized = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    const re = new RegExp(`${sanatized}`, 'i');
    return source.filter((ingredient) => ingredient.search(re) >= 0);
  };

  const onIngredientPressed = (ingredientName) => {
    setNewIngredientName(ingredientName);
    const knownIng = findRecipeIngredient(ingredientName);
    if (knownIng) {
      // If we are modifying an existing recipe ingredient then pickup the currently specificed quantity so the user can edit it.
      setNewIngredientQty(knownIng.quantity);
    }
    setQtyModalVisible(true);
  };

  const onSubmitEditing = () => {
    onIngredientPressed(query.trim().toLowerCase());
  };

  const dismissQtyModal = () => {
    setQtyModalVisible(false);
    if (ingNameParam) {
      // setTimeout(() => navigation.goBack(), 50);
      navigation.goBack();
    }
  };

  useLayoutEffect(() => {
    setAllIngredients(appState.getAllIngredients());

    // FIXME: Ingredient editing should be part of the RecipeEditor screen and not part of the
    // EditRecipeIngredients screen; I just put it here because I'm being lazy.
    if (ingNameParam) {
      const knownIng = findRecipeIngredient(ingNameParam);
      if (knownIng) {
        onIngredientPressed(knownIng.name);
      }
    }
  }, [sessionState.getRecipeModificationState()]);

  const renderIngredient = ({ item }) => (
    <TouchableOpacity onPress={() => { onIngredientPressed(item); }}>
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  const CreateNewIngredient = () => {
    const label = `🆕 ${query}`;
    return (
      <TouchableOpacity onPress={() => { onSubmitEditing(); }}>
        <Text style={styles.itemText}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  let visibleIngredients = [];
  if (query.trim().length >= MinSearchLength) {
    visibleIngredients = searchIngredients(allIngredients)
      .sort(alphabetically);
  }

  const QueryTooShort = () => {
    const msg = `Enter at least ${MinSearchLength} characters`;
    return (
      <Text style={styles.queryTooShortText}>{msg}</Text>
    );
  };

  const showCreateNewIngredient = query.trim().length >= MinSearchLength && !visibleIngredients.includes(query.trim().toLowerCase());
  const showQueryTooShort = query.trim().length < MinSearchLength;
  const qtyModalTitle = `Required quantity of ${newIngredientName}`;

  return (
    <>
      <Portal>
        <Modal visible={qtyModalVisible} onDismiss={() => dismissQtyModal(false)} style={{ bottom: 340 }} contentContainerStyle={styles.qtyModalStyle}>
          <Title>{qtyModalTitle}</Title>
          <Text style={{ marginBottom: 10 }}>eg: `2`, `250g`, etc</Text>
          <ThemedTextInput
            autoFocus
            autoCorrect={false}
            value={newIngredientQty}
            dense
            onChangeText={setNewIngredientQty}
            onSubmitEditing={() => onNewIngredientAdded()}
          />
        </Modal>
      </Portal>

      <View style={styles.viewContainer}>
        {!ingNameParam && (
          <FlatList
            ListHeaderComponent={(
              <>
                <Searchbar
                  style={styles.searchbar}
                  onSubmitEditing={onSubmitEditing}
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholder="Ingredient name"
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="done"
                />
                {showCreateNewIngredient && <CreateNewIngredient />}
                {showQueryTooShort && <QueryTooShort />}
              </>
            )}
            extraData={ingredientAdded}
            data={visibleIngredients}
            ItemSeparatorComponent={Divider}
            keyExtractor={(ingredient) => kebab(ingredient || '-')}
            renderItem={(renderIngredient)}
          />
        )}
      </View>
    </>
  );
}
