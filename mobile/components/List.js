import { useNavigation } from '@react-navigation/core';
import React, { useContext, useState, useEffect } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Button, IconButton, Subheading, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppStateCtx } from '../service/context';
import { toIngredientList } from './helpers/ingredientList';
import { useNavigationFocusListener } from './helpers/navigation';
import { toPlannerGridData } from './helpers/planData';
import { WeekSelector } from './widgets/WeekSelector';

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

    const sectionData = [];
    const { ingredients, meals } = toIngredientList(gridData[selectedWeek], recipes);
    if (ingredients.length > 0) {
      sectionData.push({ title: 'Ingredients', data: ingredients });
    }
    if (meals.length > 0) {
      sectionData.push({ title: 'Meals', data: meals });
    }
    setListData(sectionData);
  };

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

  const SectionHeader = ({ section }) => (
    <Subheading style={{ fontSize: 18, textDecorationLine: 'underline' }}>{section.title}</Subheading>
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

  const EmptyShoppingList = () => {
    const week = (selectedWeek === 'thisWeek') ? 'this week' : 'next week';
    const msg = `There's nothing on ${week}'s plan`;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <IconButton icon="calendar-alert" color="#d8e2dc" size={128} />
        <Text>{msg}</Text>
      </View>
    );
  };

  const ListTitle = () => {
    const week = (selectedWeek === 'thisWeek') ? 'This Week' : 'Next Week';
    const msg = `${week}'s Shopping List`;
    return <Title>{msg}</Title>;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        {listData.length > 0 && (
          <SectionList
            ListHeaderComponent={<ListTitle />}
            contentContainerStyle={{ padding: 12, paddingBottom: 50 }}
            sections={listData}
            keyExtractor={(entry, index) => `${entry.ingredient || entry.name}-${index}`}
            renderItem={({ item }) => <Item item={item} />}
            renderSectionHeader={({ section }) => <SectionHeader section={section} />}
          />
        )}
        {listData.length === 0 && (
          <EmptyShoppingList />
        )}
        <WeekSelector selectedWeek={selectedWeek} onSelect={(value) => setSelectedWeek(value)} />
      </View>
    </SafeAreaView>
  );
}
