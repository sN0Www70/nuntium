// deps
import React from "react";
import { Text, TextInput, TouchableOpacity, StyleSheet, View } from "react-native";

// h1
export function H1({ children }) { return <Text style={s.h1}>{children}</Text>; }

// p
export function P({ children, style }) { return <Text style={[s.p, style]}>{children}</Text>; }

// input
export function Input(props) { return <TextInput {...props} style={[s.input, props.style]} placeholderTextColor="#6b6b6b" />; }

// button
export function Button({ label, onPress, disabled, style }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[s.btn, disabled && s.btnDis, style]}>
      <Text style={s.btnT}>{label}</Text>
    </TouchableOpacity>
  );
}

// link
export function LinkText({ children, onPress, style }) {
  return <Text onPress={onPress} style={[s.link, style]}>{children}</Text>;
}

// error
export function ErrorText({ children, style }) { return <Text style={[s.err, style]}>{children}</Text>; }

// checkbox
export function Checkbox({ label, value, onChange }) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} style={s.cbRow}>
      <View style={[s.cbBox, value && s.cbBoxOn]} />
      <Text style={s.cbTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

// styles
const s = StyleSheet.create({
  h1:{fontSize:28,fontWeight:"800",color:"#fff",marginBottom:10,textAlign:"center"},
  p:{fontSize:14,color:"#e8f1ec"},
  input:{width:"100%",padding:14,backgroundColor:"#fff",borderRadius:14,marginTop:12,fontSize:16},
  btn:{width:"100%",padding:14,backgroundColor:"#2e7d32",borderRadius:14,alignItems:"center",marginTop:12},
  btnDis:{backgroundColor:"#4caf50"},
  btnT:{color:"#fff",fontWeight:"700",fontSize:16},
  link:{color:"#3be18d",textDecorationLine:"underline"},
  err:{color:"#ff6b6b",fontSize:14},
  cbRow:{flexDirection:"row",alignItems:"center",marginTop:12},
  cbBox:{width:22,height:22,borderRadius:6,borderWidth:2,borderColor:"#cfead9",backgroundColor:"transparent",marginRight:10},
  cbBoxOn:{backgroundColor:"#3be18d",borderColor:"#3be18d"},
  cbTxt:{color:"#e8f1ec",fontSize:14}
});
