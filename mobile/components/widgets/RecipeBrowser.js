import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import {
  FlatList, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import {
  Text, Chip, Searchbar, Button, Divider,
} from 'react-native-paper';

import { kebab } from '../helpers/kebab';

const styles = StyleSheet.create({
  recipeListItem: {
    marginVertical: 10,
  },
  recipeName: {
    fontSize: 18,
  },
  recipeIngredients: {
    color: '#808080',
  },
  tagListContainer: {
    justifyContent: 'center',
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
    paddingBottom: 4,
  },
  tagListItem: {
    margin: 3,
  },
  noResultsFoundContainer: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
  },
});

export const RecipeBrowser = React.forwardRef(({ recipes, onRecipePress, onSearchSubmitted }, ref) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [query, setQuery] = useState('');

  const searchbarRef = useRef();
  const flatlistRef = useRef();

  const resetFilters = () => {
    setSelectedTags([]);
    setQuery('');
  };

  useImperativeHandle(ref, () => ({
    searchbar: {
      focus() {
        resetFilters();
        flatlistRef.current.scrollToOffset({ animated: true, offset: 0 });
        // TODO: Not sure why I need a timeout here, but I do otherwise the keyboard
        // doesn't appear.
        setTimeout(() => {
          searchbarRef.current.focus();
        }, 750);
      },
    },
  }));

  const tags = [...new Set(
    recipes.map((item) => item.tags)
      .flat()
      .filter((item) => item !== ''),
  )];

  const toggleTag = (tag) => {
    if (selectedTags.indexOf(tag) !== -1) {
      setSelectedTags(selectedTags.filter((item) => item !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filterRecipes = () => {
    if (!selectedTags.length) {
      return recipes;
    }
    return recipes.filter((recipe) => selectedTags.every((selectedTag) => recipe.tags.includes(selectedTag)));
  };

  const searchRecipes = (source) => {
    const sanatized = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    const re = new RegExp(`${sanatized}`, 'i');
    return source.filter((recipe) => recipe.name.search(re) >= 0);
  };

  let visibleRecipes = filterRecipes();
  if (query.trim().length > 0) {
    visibleRecipes = searchRecipes(visibleRecipes);
  }
  visibleRecipes = visibleRecipes.sort((a, b) => {
    const aa = a.name.toLowerCase();
    const bb = b.name.toLowerCase();
    if (aa === bb) return 0;
    if (aa > bb) return 1;
    return -1;
  });

  const onSubmitEditing = () => {
    if (typeof onSearchSubmitted === 'function') {
      onSearchSubmitted(query);
    }
  };

  const renderRecipe = ({ item }) => {
    const ingredientsList = item.ingredients.map((ing) => ing.name).join(', ');
    return (
      <View style={styles.recipeListItem}>
        <TouchableOpacity onPress={() => { onRecipePress(item); }}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeIngredients}>{ingredientsList}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const TagList = () => (
    <View style={styles.tagListContainer}>
      {tags.map((tag) => {
        const isSelected = selectedTags.indexOf(tag) !== -1;
        return (
          <Chip
            style={styles.tagListItem}
            mode="outlined"
            selected={isSelected}
            key={kebab(tag)}
            onPress={() => toggleTag(tag)}
          >
            {tag}
          </Chip>
        );
      })}
    </View>
  );

  const noRecipes = (
    <View style={styles.noResultsFoundContainer}>
      <Text>No recipes match your query</Text>
      <Button onPress={() => resetFilters()}>
        Reset Filters
      </Button>
    </View>
  );

  const divvy = () => (<Divider />);

  return (
    <FlatList
      ListHeaderComponent={(
        <>
          <Searchbar
            ref={searchbarRef}
            onSubmitEditing={onSubmitEditing}
            autoCorrect={false}
            placeholder="Recipe name"
            value={query}
            onChangeText={setQuery}
            returnKeyType={onSearchSubmitted ? 'done' : 'search'}
          />
          <TagList />
          {visibleRecipes.length === 0 && noRecipes}
        </>
      )}
      ref={flatlistRef}
      contentContainerStyle={{ padding: 12 }}
      ItemSeparatorComponent={divvy}
      data={visibleRecipes}
      keyExtractor={(recipe) => recipe.id}
      renderItem={renderRecipe}
      extraData={selectedTags}
    />
  );
});
