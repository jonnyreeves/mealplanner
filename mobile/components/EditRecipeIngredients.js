import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Text, Title, Searchbar, TextInput, Portal, Modal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { kebab } from './helpers/kebab';
import { AppStateCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { useNavigationFocusListener } from './helpers/navigation';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
  itemText: {
    fontSize: 18,
  },
  qtyModalStyle: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
  },
});

export default function EditRecipeIngredients({ route }) {
  const { recipeId } = route.params;

  const navigation = useNavigation();
  const appState = useContext(AppStateCtx);

  const [recipe, setRecipe] = useState(null);

  const [query, setQuery] = useState('');
  const [qtyModalVisible, setQtyModalVisible] = useState(false);

  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('1');

  const [ingredientValues, setIngredientValues] = useState([]);

  const onNewIngredientAdded = () => {
    let newValue = '';
    // eslint-disable-next-line eqeqeq
    if (parseInt(newIngredientQty, 10) == newIngredientQty) {
      newValue = `${newIngredientQty}x ${newIngredientName}`;
    } else {
      newValue = `${newIngredientQty} ${newIngredientName}`;
    }
    console.log(newValue);

    if (!ingredientValues.includes(newValue)) {
      appState.updateRecipeModificationState({ ingredientValues: [...ingredientValues, newValue] });
    }
    setNewIngredientName('');
    setNewIngredientQty('');
    navigation.goBack();
  };

  useEffect(React.useCallback(() => {
    const r = appState.getRecipeById(recipeId);
    if (r) {
      setRecipe(r);
      setIngredientValues(r.ingredients.map((ing) => ing.value));
    }
  }), []);

  useNavigationFocusListener(navigation, () => {
    const modState = appState.getRecipeModificationState();
    if (modState?.ingredientValues) {
      setIngredientValues(modState.ingredientValues);
    }
  });

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

  const noIngredients = (
    <TouchableOpacity onPress={() => { onSubmitEditing(); }}>
      <Text style={styles.itemText}>{query} (create new)</Text>
    </TouchableOpacity>
  );

  if (!recipe) return (<LoadingSpinner message="Fetching recipe details" />);

  let visibleIngredients = appState.getAllIngredients();
  if (query.trim().length > 0) {
    visibleIngredients = searchIngredients(visibleIngredients);
  }
  visibleIngredients = visibleIngredients.sort((a, b) => {
    const aa = a.toLowerCase().charCodeAt(0);
    const bb = b.toLowerCase().charCodeAt(0);
    if (aa === bb) return 0;
    if (aa > bb) return 1;
    return -1;
  });

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
                onSubmitEditing={onSubmitEditing}
                autoCorrect={false}
                placeholder="Search or add a new ingredient"
                value={query}
                onChangeText={setQuery}
                returnKeyType={'done'}
              />
              {visibleIngredients.length === 0 && noIngredients}
            </>
          )}
          data={visibleIngredients}
          keyExtractor={(ingredient) => kebab(ingredient)}
          renderItem={(renderIngredient)}
        />


      </View>
    </>
  );
}
