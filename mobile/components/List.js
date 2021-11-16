import { useNavigation } from '@react-navigation/core';
import React, { useContext, useState, useEffect } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Button, Subheading, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppStateCtx } from '../service/context';
import { toIngredientList } from './helpers/ingredientList';
import { useNavigationFocusListener } from './helpers/navigation';
import { toPlannerGridData } from './helpers/planData';

const styles = StyleSheet.create({
  weekSelectorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default function List() {
  const appState = useContext(AppStateCtx);
  const navigation = useNavigation();

  const [listData, setListData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('nextWeek');

  const refresh = () => {
    const recipes = appState.getRecipes();
    const planData = appState.getPlanData();
    const gridData = toPlannerGridData(Object.values(planData));

    const ingredientsList = toIngredientList(gridData[selectedWeek], recipes);
    setListData([
      { title: 'Ingredients', data: ingredientsList.knownIngredients },
      { title: 'Meals', data: ingredientsList.unknownMeals },
    ]);
  };

  useNavigationFocusListener(navigation, () => refresh());

  useEffect(() => {
    const unsub = appState.addListener('recipes_updated', () => refresh());
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = appState.addListener('plan_updated', () => refresh());
    return () => unsub();
  }, []);

  useEffect(() => {
    refresh();
  }, [selectedWeek]);

  const thisWeekOn = <Button mode="contained" style={{ marginRight: 10 }} onPress={() => false}>This Week</Button>;
  const thisWeekOff = <Button mode="outlined" style={{ marginRight: 10 }} onPress={() => setSelectedWeek('thisWeek')}>This Week</Button>;
  const nextWeekOn = <Button mode="contained" onPress={() => false}>Next Week</Button>;
  const nextWeekOff = <Button mode="outlined" onPress={() => setSelectedWeek('nextWeek')}>Next Week</Button>;

  const SectionHeader = ({ section }) => (
    <Subheading style={{ fontSize: 18 }}>{section.title}</Subheading>
  );

  const MealList = ({ meals }) => (
    meals
      .map((m) => m.name)
      .map((name) => (
        <View key={name} style={{ flexDirection: 'row', paddingLeft: 24 }}>
          <Text style={{ color: '#808080' }}>{'\u2022'}</Text>
          <Text style={{ flex: 1, paddingLeft: 5, color: '#808080' }}>{name}</Text>
        </View>
      ))
  );

  const Item = ({ item }) => {
    if (item.ingredient) {
      return (
        <View style={{ paddingBottom: 8, paddingLeft: 12 }}>
          <Text style={{ fontSize: 16 }}>
            {item.qty}
            {' '}
            {item.ingredient}
          </Text>
          <MealList meals={item.meals} />
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row', paddingLeft: 12 }}>
        <Text>{'\u2022'}</Text>
        <Text style={{ flex: 1, paddingLeft: 5, fontSize: 16 }}>{item.name}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <SectionList
          contentContainerStyle={{ padding: 12, paddingBottom: 50 }}
          sections={listData}
          keyExtractor={(entry, index) => `${entry.ingredient || entry.name}-${index}`}
          renderItem={({ item }) => <Item item={item} />}
          renderSectionHeader={({ section }) => <SectionHeader section={section} />}
        />
        <View style={styles.weekSelectorButtonContainer}>
          {selectedWeek === 'thisWeek'
            && (
              <>
                {thisWeekOn}
                {nextWeekOff}
              </>
            )}
          {selectedWeek === 'nextWeek'
            && (
              <>
                {thisWeekOff}
                {nextWeekOn}
              </>
            )}
        </View>
      </View>
    </SafeAreaView>
  );
}
