import React from 'react';
import { Linking } from 'react-native';
import { Provider, Appbar, Title, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
;

export default function MealInfo ({ route }) {
    const { meal } = route.params;
    const navigation = useNavigation();

    console.log(meal);

    const RecipeCard = ({ recipe }) => {
        console.log(recipe);
        if (!recipe) return <React.Fragment />
        if (recipe.substr(0, 4) === "http") {
            return (
                <Button onPress={() => Linking.openURL(recipe) }>
                    Open Recipe
                </Button>
            );

        }
        return <Text>{recipe}</Text>
    }

    return (
        <Provider>
            <Appbar.Header>
                <Appbar.BackAction onPress={navigation.goBack} />
            </Appbar.Header>
            <Title>{meal.name}</Title>
            <RecipeCard recipe={meal.recipe} />
        </Provider>
    );
}