// deps
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button } from "../../components/UI";
import { useSession } from "../auth/AuthProvider";

// ui
export default function Profile(){
  const { signOut } = useSession();
  return (
    <View style={s.wrap}>
      <Text style={s.h1}>Profil</Text>
      <Button label="Se déconnecter" onPress={signOut} style={{marginTop:16}} />
    </View>
  );
}

// styles
const s=StyleSheet.create({
  wrap:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#0f3d1e"},
  h1:{color:"#fff",fontSize:24,fontWeight:"800"}
});
