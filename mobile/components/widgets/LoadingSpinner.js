import React, { Fragment } from 'react';
import { Text, ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';

export const LoadingSpinner = ({ style, message = 'Fetching data' }) => (
  <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center' }}>
    <ActivityIndicator />
    <Text style={{ ...style, textAlign: 'center', padding: 12 }}>{message}</Text>
  </View>
);
