import React, { useEffect, useState } from 'react';
import {
  FlatList, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import {
  Text, Chip, Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealPlanServiceCtx } from '../service/context';
import { kebab } from './helpers/kebab';

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
  },
  tagListItem: {
    margin: 3,
  },
});

export default function Browse({ route }) {
  const { params } = route;

  const navigation = useNavigation();
  const mealPlanService = React.useContext(MealPlanServiceCtx);
  const [recipes, setRecipes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    mealPlanService.getRecipes().then((data) => setRecipes(data));
  }, []);

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

  const onRecipePress = (recipe) => {
    console.log(`you tapped: ${recipe.name}`);
    navigation.navigate('RecipeInfo', { recipe });
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity onPress={() => onRecipePress(item)}>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const TagList = () => (
    <View style={styles.tagListContainer}>
      {tags.map((tag) => {
        const isSelected = selectedTags.indexOf(tag) !== -1;
        const mode = isSelected ? 'flat' : 'outlined';
        return (
          <Chip
            style={styles.tagListItem}
            mode={mode}
            key={kebab(tag)}
            onPress={() => toggleTag(tag)}
          >
            {tag}
          </Chip>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.viewContainer}>
      {recipes && (
        <View>
          <FlatList
            ListHeaderComponent={(
              <>
                <Searchbar autoFocus={false} autoCorrect={false} value={query} onChangeText={setQuery} />
                <TagList />
              </>
            )}
            data={visibleRecipes}
            keyExtractor={(recipe) => kebab(recipe.name)}
            renderItem={renderRecipe}
            extraData={selectedTags}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
