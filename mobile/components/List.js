import React, { useContext, useState, useEffect } from 'react';
import { SectionList, View } from 'react-native';
import { Subheading, Text } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { AppStateCtx } from '../service/context';
import { toIngredientList } from './helpers/ingredientList';
import { toPlannerGridData } from './helpers/planData';

export default function List() {
  const appState = useContext(AppStateCtx);

  const [thisWeeksList, setThisWeeksList] = useState([]);

  const refresh = () => {
    const recipes = appState.getRecipes();
    const planData = appState.getPlanData();

    const { thisWeek, nextWeek } = toPlannerGridData(Object.values(planData));

    const foo = toIngredientList(thisWeek, recipes);
    console.log(foo);
    setThisWeeksList([
      { title: "Known Ingredients", data: foo.knownIngredients },
      { title: "Unkown Meals", data: foo.unknownMeals },
    ]);
  };

  useEffect(() => {
    const unsub = appState.addListener('recipes_updated', () => refresh());
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = appState.addListener('plan_updated', () => refresh());
    return () => unsub();
  }, []);

  const SectionHeader = ({ section }) => (
    <Subheading>{section.title}</Subheading>
  );

  const Item = ({ item }) => {
    console.log(item);
    if (item.ingredient) {
      return (
        <View style={{ paddingBottom: 8, paddingLeft: 12 }}>
          <Text>{item.qty} {item.ingredient}</Text>
          <Text style={{ paddingLeft: 20 }}>Required by: {item.meals.map((m) => m.name).join(', ')}</Text>
        </View>
      );
    }
    return <Text>{item.name}</Text>;
  };

  return (
    <SafeAreaView>
      <Text>Shopping List!</Text>
      <SectionList
        contentContainerStyle={{ padding: 12 }}
        sections={thisWeeksList}
        keyExtractor={(entry, index) => `${entry.ingredient || entry.name}-${index}`}
        renderItem={({ item }) => <Item item={item} />}
        renderSectionHeader={({ section }) => <SectionHeader section={section} />}
      />
    </SafeAreaView>
  );
}
