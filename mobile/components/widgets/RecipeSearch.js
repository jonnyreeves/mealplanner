import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import AutoComplete from 'react-native-autocomplete-input';
import { kebab } from '../helpers/kebab';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    fontSize: 32,
  },
  autocompleteContainer: {
    flex: 1,
    position: 'absolute',
    zIndex: 1,
    padding: 5,
    width: '100%',
  },
  itemText: {
    fontSize: 18,
    margin: 4,
    color: 'black',
  },
});

export function RecipeSearch({ recipes, onSelect }) {
  const [query, setQuery] = useState('');

  const queryRecipes = (searchTerm) => {
    if (!recipes?.length || searchTerm.trim().length < 3) {
      return [];
    }
    const re = new RegExp(`${searchTerm.trim()}`, 'i');
    return recipes.filter((recipe) => recipe.name.search(re) >= 0);
  };

  const cmp = (str1, str2) => str1.toLowerCase().trim() === str2.toLowerCase().trim();

  const queriedRecipes = queryRecipes(query);
  const hasExactRecipeMatch = queriedRecipes?.length === 1 && cmp(queriedRecipes[0].name, query);
  const isLoading = !recipes?.length;
  const placeholder = (isLoading) ? 'Loading data...' : 'Enter recipe name';

  useEffect(() => {
    if (query?.trim() === '') {
      onSelect(null);
    } else if (hasExactRecipeMatch) {
      onSelect(queriedRecipes[0]);
    }
  }, [query]);

  const renderSearchSuggestion = ({ item: { name } }) => (
    <TouchableOpacity onPress={() => setQuery(name)}>
      <Text style={styles.itemText}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.viewContainer}>
      <View style={{ width: '90%' }}>
        <View style={styles.autocompleteContainer}>
          <AutoComplete
            editable={!isLoading}
            autoCorrect={false}
            data={hasExactRecipeMatch ? [] : queriedRecipes}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            flatListProps={{
              keyboardShouldPersistTaps: 'always',
              keyExtractor: (recipe) => kebab(recipe.name),
              renderItem: renderSearchSuggestion,
            }}
          />
        </View>
      </View>
      <View>
        <Button
          icon="close-circle"
          onPress={() => setQuery('')}
          labelStyle={styles.clearButton}
        />
      </View>
    </View>
  );
}
