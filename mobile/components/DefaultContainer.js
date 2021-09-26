import React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './Home';
import Plan from './Plan';
import MealInfo from './MealInfo';

const HomeStack = createNativeStackNavigator();

const HomeRoute = () => {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Home" component={Home} />
            <HomeStack.Screen name="MealInfo" component={MealInfo} />
        </HomeStack.Navigator>
    );
}
const PlanRoute = () => {
    return (
        <Plan />
    )
}

const MealsRoute = () => <Text>Meals</Text>;
const ListRoute = () => <Text>List</Text>;

export default function DefaultContainer({ }) {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'home', title: 'Home', icon: 'home' },
        { key: 'plan', title: 'Plan', icon: 'calendar' },
        { key: 'meals', title: 'Meals', icon: 'silverware-fork-knife' },
        { key: 'list', title: 'List', icon: 'view-list' },
    ]);
    
    const renderScene = BottomNavigation.SceneMap({
        home: HomeRoute,
        plan: PlanRoute,
        meals: MealsRoute,
        list: ListRoute,
      });

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                    <BottomNavigation
                        navigationState={{ index, routes }}
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                    />
            </NavigationContainer>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({});