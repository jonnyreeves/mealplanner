import React from 'react';
import { RefreshControl, SectionList, View } from 'react-native';
import {
  Divider, Checkbox, Text, IconButton, Title,
} from 'react-native-paper';
import { shortPrettyMealSlot } from '../helpers/date';
import { kebab } from '../helpers/kebab';
import { PlanSelector } from './PlanSelector';

const SectionHeader = ({ section }) => (
  <Title>{section.title}</Title>
);

export const MealPlanShoppingList = ({ sections, selectedPlanId, onStoreLinkPress }) => {
  const formatIngredientQty = (value) => {
    if (parseInt(value, 10).toString() === value) {
      return `${value}x`;
    }
    return value;
  };

  const bulletPoint = <Text style={{ color: '#808080' }}>{'\u2022'}</Text>;

  const MealList = ({ meals }) => (
    meals
      .map(({
        name, date, slot, ingredientQty,
      }) => {
        const key = `${name}-${date}-${slot}`;
        const qtyAndMealName = `${formatIngredientQty(ingredientQty)} for ${name} (${shortPrettyMealSlot(slot, date)})`;
        return (
          <View key={key} style={{ flexDirection: 'row', paddingLeft: 24 }}>
            {bulletPoint}
            <Text style={{ flex: 1, paddingLeft: 5, color: '#808080' }}>{qtyAndMealName}</Text>
          </View>
        );
      })
  );

  const RequiredIngredient = ({ item, style }) => (
    <View style={style}>
      <Text style={{ fontSize: 16 }}>
        {formatIngredientQty(item.qty)}
        {' '}
        {item.ingredient}
      </Text>
      <MealList meals={item.meals} />
    </View>
  );

  const IngredientListItem = ({ item }) => {
    const openStore = () => onStoreLinkPress(item.ingredient);
    const showBasketButton = true; // TODO: Disable basket for current/active plan?
    return (
      <View style={{ flexDirection: 'row' }}>
        <RequiredIngredient item={item} style={{ flexGrow: 1, flexShrink: 0, flexBasis: 'auto' }} />
        {showBasketButton && <IconButton icon="basket-outline" onPress={openStore} style={{ flexGrow: 0, flexShrink: 1, flexBasis: 'auto' }} />}
      </View>
    );
  };

  const MealWithoutIngredientsListItem = ({ item }) => (
    <>
      <Text style={{ fontSize: 16 }}>{item.name}</Text>
      <View style={{ flexDirection: 'row', paddingLeft: 24 }}>
        {bulletPoint}
        <Text style={{ flex: 1, paddingLeft: 5, color: '#808080' }}>{shortPrettyMealSlot(item.slot, item.date)}</Text>
      </View>
    </>
  );

  const mealPlanKeyExtrator = (item) => {
    if (item.ingredient) {
      return `key-${kebab(item.ingredient)}`;
    }
    return `key-${kebab(item.name)}-${item.slot}-${item.date}`;
  };

  const renderSectionListItem = ({ item, section }) => {
    let contents;
    switch (section.type) {
      case 'ingredients':
        contents = <IngredientListItem item={item} />;
        break;
      case 'meals':
        contents = <MealWithoutIngredientsListItem item={item} />;
        break;
      default:
        throw new Error(`unexpected section type: ${section.type}`);
    }
    return (
      <View style={{ marginVertical: 10, paddingLeft: 12, display: 'flex' }}>
        {contents}
      </View>
    );
  };

  const EmptyShoppingList = () => {
    // const week = (selectedWeek === 'thisWeek') ? 'this week' : 'next week';
    const week = selectedPlanId;
    const msg = `There's nothing on ${week}'s plan`;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <IconButton icon="calendar-alert" color="#d8e2dc" size={128} />
        <Text>{msg}</Text>
      </View>
    );
  };

  return (
    <SectionList
      ItemSeparatorComponent={Divider}
      ListEmptyComponent={EmptyShoppingList}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
      sections={sections}
      initialNumToRender={15}
      keyExtractor={mealPlanKeyExtrator}
      renderItem={renderSectionListItem}
      renderSectionHeader={SectionHeader}
    />
  );
};

export const ShoppingList = ({
  sections, onStoreLinkPress, onCheckboxPress, refreshing, onRefresh,
}) => {
  const shoppingListKeyExtractor = (item) => (`key-${kebab(item.item)}`);

  const ShoppingListEntry = ({ item: { item, checked }, section: { listName } }) => (
    <View style={{ marginVertical: 10, paddingLeft: 12, display: 'flex' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => onCheckboxPress(listName, item)} />
        <Text style={{
          fontSize: 16, flexGrow: 1, flexShrink: 0, flexBasis: 'auto',
        }}
        >
          {item}
        </Text>
        <IconButton icon="basket-outline" onPress={() => onStoreLinkPress(item)} style={{ flexGrow: 0, flexShrink: 1, flexBasis: 'auto' }} />
      </View>
    </View>
  );

  return (
    <>
      <SectionList
        ItemSeparatorComponent={Divider}
        contentContainerStyle={{ padding: 12, paddingBottom: 50 }}
        sections={sections}
        initialNumToRender={15}
        keyExtractor={shoppingListKeyExtractor}
        renderItem={ShoppingListEntry}
        renderSectionHeader={SectionHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </>
  );
};
