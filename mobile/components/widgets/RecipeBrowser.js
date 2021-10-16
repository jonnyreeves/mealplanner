import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import {
  FlatList, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import {
  Text, Chip, Searchbar, Button,
} from 'react-native-paper';

import { kebab } from '../helpers/kebab';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 12,
  },
  itemText: {
    fontSize: 18,
  },
  tagListContainer: {
    justifyContent: 'center',
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
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

  useImperativeHandle(ref, () => ({
    searchbar: {
      focus() {
        // TODO: Not sure why I need a timeout here, but I do :(
        setTimeout(() => searchbarRef.current.focus(), 500);
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
    const aa = a.name.toLowerCase().charCodeAt(0);
    const bb = b.name.toLowerCase().charCodeAt(0);
    if (aa === bb) return 0;
    if (aa > bb) return 1;
    return -1;
  });

  const onSubmitEditing = () => {
    if (typeof onSearchSubmitted === 'function') {
      onSearchSubmitted(query);
    }
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity onPress={() => { onRecipePress(item); }}>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

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
      <Button onPress={() => {
        setSelectedTags([]);
        setQuery('');
      }}
      >
        Reset Filters
      </Button>
    </View>
  );


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
      data={visibleRecipes}
      keyExtractor={(recipe) => kebab(recipe.name)}
      renderItem={renderRecipe}
      extraData={selectedTags}
    />
  );
});
