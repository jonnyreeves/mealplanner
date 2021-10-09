import React, { useEffect, useState } from 'react';
import {
  FlatList, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import {
  Text, Chip, Searchbar, Title,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getDayOfTheWeek } from './helpers/date';
import { MealPlanServiceCtx } from '../service/context';
import { kebab } from './helpers/kebab';
import { usePlanModifers } from '../service/mealPlanService';

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

export default function ChooseRecipe({ route }) {
  const { params } = route;

  const navigation = useNavigation();

  const mealPlanService = React.useContext(MealPlanServiceCtx);
  const [recipes, setRecipes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [query, setQuery] = useState('');

  const api = usePlanModifers({ mealPlanService });

  const { meal, action } = params;
  const prettySlot = meal.slot.substring(0, 1).toUpperCase() + meal.slot.substring(1);
  const dow = getDayOfTheWeek(meal.date);
  navigation.setOptions({ headerTitle: `Choose ${prettySlot} for ${dow}` });

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
    console.log(recipe);
    if (params?.action === 'select') {
      console.log(`setMeal => ${meal.date} - ${recipe.name}`);
      api.setMeal({ date: meal.date, slot: meal.slot, recipeName: recipe.name });
      setTimeout(() => navigation.popToTop(), 4);
    }
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
    <View style={styles.viewContainer}>
      {recipes && (
        <View>
          <FlatList
            ListHeaderComponent={(
              <>
                <Searchbar autoFocus autoCorrect={false} value={query} onChangeText={setQuery} />
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
    </View>
  );
}
