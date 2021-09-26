import React, { Fragment } from 'react';
import { StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

export const LoadingSpinner = ({ message = "Fetching data" }) => {
    return (
        <Fragment>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", padding: 12 }}>{message}</Text>
        </Fragment>
    )
}