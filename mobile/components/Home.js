import React, { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Title, Paragraph, Headline, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealPlanApiContext } from '../apiContext';
import { LoadingSpinner } from './widgets/LoadingSpinner';
import { toTodayAndTomorrowData } from './helpers/planData';

export default function Home({ }) {
    const navigation = useNavigation();

    const api = React.useContext(MealPlanApiContext);
    const [ mealData, setMealData ] = React.useState(null);
    
    React.useEffect(() => {
        if (!mealData) {
            api.getPlan()
                .then(data => {
                    const result = toTodayAndTomorrowData(data);
                    console.log(result);
                    setMealData(result);
                });
        }
    })

    const MealCardGroup = ({ mealRow }) => {
        return (
            <View style={styles.mealCardContainer}>
                <MealCard slot="Lunch" meal={mealRow.lunch} />
                <MealCard slot="Dinner" meal={mealRow.dinner} />
            </View>
        )
    }

    const MealCard = ({ slot, meal }) => {
        const title = meal.name || "Nothing planned";
        const onPress = meal.name ? () => navigation.navigate("MealInfo", { meal }) : undefined;
        return (
            <Card onPress={onPress} style={{ flex: 1, margin: 5 }}>
                <Card.Content>
                    <Title>{title}</Title>
                    <Paragraph>{slot}</Paragraph>
                </Card.Content>
            </Card>
        )
    }

    const HomeView = () => (
        <Fragment>
            <Headline>Today :)</Headline> 
            <MealCardGroup mealRow={mealData[0]} />

            <Headline>Tomorrow</Headline> 
            <MealCardGroup mealRow={mealData[1]} />
        </Fragment>
    );

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
            { !mealData && <LoadingSpinner /> }
            { mealData && <HomeView /> }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    mealCardContainer: {
      flex: 1,
      padding: 10,
      flexDirection: "row",
    },
  });