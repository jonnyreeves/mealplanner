import React from 'react';
import { TextInput } from 'react-native-paper';

import { theme } from '../../theme';

export const ThemedTextInput = ({
  style, value, label, onChangeText, onSubmitEditing, multiline, placeholder, ...props
}) => (
  <TextInput
    style={style}
    label={label}
    mode="outlined"
    placeholder={placeholder}
    theme={{ ...theme, roundness: 8 }}
    value={value}
    onChangeText={onChangeText}
    onSubmitEditing={onSubmitEditing}
    multiline={multiline}
    blurOnSubmit
    {...props}
  />
);
