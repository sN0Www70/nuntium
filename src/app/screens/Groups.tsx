import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Groups() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Groupes</Text>
      <Text style={styles.sub}>Ici s’afficheront les communautés et groupes étudiants.</Text>
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
  text: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sub: {
    fontSize: 16,
    color: "#666",
  },
});
