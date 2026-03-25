import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function DashboardScreen() {   // change name per file
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DashboardScreen — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { color: colors.textPrimary, fontSize: 16 },
});