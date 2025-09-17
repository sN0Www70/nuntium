import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Help() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aide & Entraide</Text>
      <Text style={styles.sub}>Section entraide, CGU et support technique.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sub: {
    fontSize: 16,
    color: "#666",
  },
});
