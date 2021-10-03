import React, { Fragment } from 'react';
import { Text, ActivityIndicator } from 'react-native-paper';

export const LoadingSpinner = ({ style, message = 'Fetching data' }) => (
  <>
    <ActivityIndicator />
    <Text style={{ ...style, textAlign: 'center', padding: 12 }}>{message}</Text>
  </>
);
