// deps
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Pressable,
} from "react-native";

// h1
export function H1({ children }) {
  return <Text style={s.h1}>{children}</Text>;
}

// p
export function P({ children, style }) {
  return <Text style={[s.p, style]}>{children}</Text>;
}

// input
export function Input(props) {
  return (
    <TextInput
      {...props}
      style={[s.input, props.style]}
      placeholderTextColor="#6b6b6b"
    />
  );
}

// button
export function Button({ label, onPress, disabled, style, variant = "primary" }) {
  const [hovered, setHovered] = useState(false);

  let baseStyle = [s.btnBase];
  let textStyle = [s.btnText];

  if (variant === "primary") {
    textStyle.push({ color: "#2e7d32" });
    if (hovered) baseStyle.push(s.btnPrimaryHover);
  } else if (variant === "danger") {
    textStyle.push({ color: "#c0392b" });
    if (hovered) baseStyle.push(s.btnDangerHover);
  } else if (variant === "outline") {
    textStyle.push({ color: "#444" });
    if (hovered) baseStyle.push(s.btnOutlineHover);
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        baseStyle,
        pressed && { opacity: 0.8 },
        disabled && s.btnDis,
        style,
      ]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

// link
export function LinkText({ children, onPress, style }) {
  return (
    <Text onPress={onPress} style={[s.link, style]}>
      {children}
    </Text>
  );
}

// error
export function ErrorText({ children, style }) {
  return <Text style={[s.err, style]}>{children}</Text>;
}

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
  h1: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  p: { fontSize: 14, color: "#000000ff" },
  input: {
    width: "100%",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  // --- Buttons
  btnBase: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  btnPrimaryHover: {
    backgroundColor: "#eaf6ed", // vert clair discret
    borderColor: "#2e7d32",
  },
  btnDangerHover: {
    backgroundColor: "#fdecea", // rouge clair discret
    borderColor: "#c0392b",
  },
  btnOutlineHover: {
    backgroundColor: "#f5f5f5",
  },
  btnText: {
    fontWeight: "700",
    fontSize: 16,
  },
  btnDis: { opacity: 0.6 },

  link: { color: "#3be18d", textDecorationLine: "underline" },
  err: { color: "#ff6b6b", fontSize: 14 },

  cbRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  cbBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cfead9",
    backgroundColor: "transparent",
    marginRight: 10,
  },
  cbBoxOn: { backgroundColor: "#3be18d", borderColor: "#3be18d" },
  cbTxt: { color: "#444", fontSize: 14 },
});
