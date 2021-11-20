import React, { useContext, useLayoutEffect, useState } from 'react';
import { AppState, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Text, Title, Searchbar, TextInput, Portal, Modal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { kebab } from './helpers/kebab';
import { AppStateCtx } from '../service/context';

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
  },
  queryTooShortText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
  qtyModalStyle: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
  },
});

const MinSearchLength = 2;

export default function EditRecipeIngredients() {
  const navigation = useNavigation();
  const appState = useContext(AppStateCtx);

  const [query, setQuery] = useState('');
  const [qtyModalVisible, setQtyModalVisible] = useState(false);

  const [allIngredients, setAllIngredients] = useState([]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('1');

  const [ingredients, setIngredients] = useState([]);

  const onNewIngredientAdded = () => {
    let newValue = '';
    // eslint-disable-next-line eqeqeq
    if (parseInt(newIngredientQty, 10) == newIngredientQty) {
      newValue = `${newIngredientQty}x ${newIngredientName}`;
    } else {
      newValue = `${newIngredientQty} ${newIngredientName}`;
    }

    const newIngredient = {
      name: newIngredientName,
      quantity: newIngredientQty,
      value: newValue,
    };

    const targetIdx = ingredients.findIndex((ing) => ing.value === newValue);
    if (targetIdx === -1) {
      appState.updateRecipeModificationState({ ingredients: [...ingredients, newIngredient] });
    }

    setNewIngredientName('');
    setNewIngredientQty('');
    navigation.goBack();
  };

  useLayoutEffect(() => {
    setAllIngredients(appState.getAllIngredients());
    const modState = appState.getRecipeModificationState();
    if (modState) {
      setIngredients(modState.ingredients || []);
    }
  }, [appState.getRecipeModificationState()]);

  const searchIngredients = (source) => {
    const sanatized = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    const re = new RegExp(`${sanatized}`, 'i');
    return source.filter((ingredient) => ingredient.search(re) >= 0);
  };

  const onSubmitEditing = () => {
    setNewIngredientName(query);
    setQtyModalVisible(true);
  };

  const onIngredientPressed = (ingredient) => {
    setNewIngredientName(ingredient);
    setQtyModalVisible(true);
  };

  const renderIngredient = ({ item }) => (
    <TouchableOpacity onPress={() => { onIngredientPressed(item); }}>
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  const createNewIngredient = (
    <TouchableOpacity onPress={() => { onSubmitEditing(); }}>
      <Text style={styles.itemText}>{query} (create new)</Text>
    </TouchableOpacity>
  );

  let visibleIngredients = [];
  if (query.trim().length >= MinSearchLength) {
    visibleIngredients = searchIngredients(allIngredients)
      .sort((a, b) => {
        const aa = a.toLowerCase().charCodeAt(0);
        const bb = b.toLowerCase().charCodeAt(0);
        if (aa === bb) return 0;
        if (aa > bb) return 1;
        return -1;
      });
  }

  const QueryTooShort = () => {
    const msg = `Enter at least ${MinSearchLength} characters`;
    return (
      <Text style={styles.queryTooShortText}>{msg}</Text>
    );
  };

  const showCreateNewIngredient = query.trim().length >= MinSearchLength && !visibleIngredients.includes(query.trim());
  const showQueryTooShort = query.trim().length < MinSearchLength;

  return (

    <>
      {qtyModalVisible && (
        <Portal>
          <Modal visible={qtyModalVisible} onDismiss={() => setQtyModalVisible(false)} style={{ bottom: 300 }} contentContainerStyle={styles.qtyModalStyle}>
            <Title>Quantity of {newIngredientName}</Title>
            <Text style={{ marginBottom: 10 }}>eg: `2`, `250g`, etc</Text>
            <TextInput
              autoFocus
              autoCorrect={false}
              value={newIngredientQty}
              dense
              onChangeText={setNewIngredientQty}
              onSubmitEditing={() => onNewIngredientAdded()}
            />
          </Modal>
        </Portal>
      )}

      <View style={styles.viewContainer}>
        <FlatList
          ListHeaderComponent={(
            <>
              <Searchbar
                style={styles.searchbar}
                onSubmitEditing={onSubmitEditing}
                autoCorrect={false}
                placeholder="Search or add a new ingredient"
                value={query}
                onChangeText={setQuery}
                returnKeyType="done"
              />
              {showCreateNewIngredient && createNewIngredient}
              {showQueryTooShort && <QueryTooShort />}
            </>
          )}
          data={visibleIngredients}
          keyExtractor={(ingredient) => kebab(ingredient || '-')}
          renderItem={(renderIngredient)}
        />
      </View>
    </>
  );
}
