import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { kebab } from '../helpers/kebab';

const _tableStyles = StyleSheet.create({
  table: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
  },
  tableRow: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginBottom: 4,
  },
});

export const Table = ({
  rows, keyExtractor, renderRow, tableStyles, rowStyles,
}) => (
  <View style={[_tableStyles.table, tableStyles]}>
    {rows.map((row) => (
      <View key={keyExtractor(row)} style={[_tableStyles.tableRow, rowStyles]}>
        {renderRow(row)}
      </View>
    ))}
  </View>
);

const ingredientsTableStyles = StyleSheet.create({
  tableRow: {
    maxHeight: 30,
  },
  qtyCell: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    marginRight: 4,
    alignSelf: 'center',
  },
  ingredientCell: {
    flex: 3,
    textAlign: 'left',
    alignSelf: 'center',
  },
  deleteButton: {
    height: 20,
    alignSelf: 'center',
  },
});

export const IngredientsTable = ({ ingredients, onDelete }) => (
  <Table
    rows={ingredients}
    tableStyles={{ marginHorizontal: 20, marginTop: 8 }}
    rowStyles={ingredientsTableStyles.tableRow}
    keyExtractor={(ing) => kebab(ing.value)}
    renderRow={(ing) => (
      <>
        <Text style={ingredientsTableStyles.qtyCell}>{ing.quantity}</Text>
        <Text style={ingredientsTableStyles.ingredientCell}>{ing.name}</Text>
        {typeof onDelete === 'function' && <IconButton style={ingredientsTableStyles.deleteButton} icon="close" onPress={() => onDelete(ing)} />}
      </>
    )}
  />
);
