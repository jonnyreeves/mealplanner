import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { kebab } from '../helpers/kebab';
import AutocompleteInput from './AutoComplete';

const styles = StyleSheet.create({
  autocompleteContainer: {
    flex: 1,
    top: 0,
    left: 0,
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'whitesmoke',
    width: '100%',
  },
  itemText: {
    fontSize: 18,
    padding: 8,
    color: 'black',
    backgroundColor: 'white',
  },
});

export function RecipeSearch({ recipes, onSelect, inputRef }) {
  const [query, setQuery] = useState('');
  const [selectedQuery, setSelectedQuery] = useState('');

  const queryRecipes = (searchTerm) => {
    if (!recipes?.length || searchTerm.trim().length < 3) {
      return [];
    }
    const re = new RegExp(`${searchTerm.trim()}`, 'i');
    return recipes.filter((recipe) => recipe.name.search(re) >= 0);
  };

  const cmp = (str1, str2) => str1.toLowerCase().trim() === str2.toLowerCase().trim();

  const queriedRecipes = queryRecipes(query);
  const matchedRecipe = queriedRecipes.find((item) => cmp(item.name, selectedQuery)) || null;
  const isLoading = !recipes?.length;
  const placeholder = (isLoading) ? 'Loading data...' : 'Enter recipe name';

  useEffect(() => {
    if (query?.trim() === '') {
      onSelect(null);
    }
  }, [query]);
  useEffect(() => {
    if (matchedRecipe) {
      onSelect(matchedRecipe);
    }
    setQuery('');
    setSelectedQuery('');
  }, [selectedQuery]);

  const onKeyPress = (event) => {
    console.log(event.key);
    if (event.key === 'Enter') {
      onSelect({ name: query });
    }
  };

  const renderSearchSuggestion = ({ item: { name } }) => (
    <TouchableOpacity onPress={() => setSelectedQuery(name)}>
      <Text style={styles.itemText}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.autocompleteContainer}>
      <AutocompleteInput
        editable={!isLoading}
        autoCorrect={false}
        innerRef={inputRef}
        data={queriedRecipes}
        value={query}
        onChangeText={setQuery}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        flatListProps={{
          keyboardShouldPersistTaps: 'always',
          keyExtractor: (recipe) => kebab(recipe.name),
          renderItem: renderSearchSuggestion,
        }}
      />
    </View>
  );
}
