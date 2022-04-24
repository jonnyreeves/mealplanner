import React, { useState } from 'react';
import { Linking } from 'react-native';
import { Button, Surface } from 'react-native-paper';

export const NextMealCard = () => {
  const now = new Date();
  const slot = (now.getHours() > 14) ? 'Dinner' : 'Lunch';
  const entry = (slot === 'Dinner') ? todaysMeal.dinner : todaysMeal.lunch;
  const recipe = recipes?.find((r) => r.name === entry.name);
  const isRecipeUrl = recipe?.recipe?.substr(0, 4) === 'http';

  const cardTitle = slot === 'Lunch' ? 'Today\'s Lunch...' : 'Tonight\'s Dinner...';
  let nextText = entry.name || 'Nothing planned';
  if (!isRecipeUrl && recipe?.recipe) {
    nextText += ` -- 📖 ${recipe.recipe}`;
  }
  const recipeBtn = (
    <Button
      style={{ marginTop: 'auto' }}
      compact
      onPress={() => Linking.openURL(recipe?.recipe)}
    >
      Open Recipe
    </Button>
  );

  return (
    <Surface style={styles.nextMealCard}>
      <View style={styles.nextMealCardContent}>
        <Title style={{ fontSize: 16 }}>{cardTitle}</Title>
        <Text>{nextText}</Text>
      </View>
      {isRecipeUrl && recipeBtn}
    </Surface>
  );
};