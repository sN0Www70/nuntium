import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { P } from "./UI";

type Props = {
  message: string;
  onPress?: () => void;
  onHide?: () => void;
  durationMs?: number;
};

export default function NotificationToast({
  message,
  onPress,
  onHide,
  durationMs = 3000,
}: Props) {
  const slide = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slide, { toValue: -80, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished && onHide) onHide();
      });
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onHide, opacity, slide]);

  return (
    <Animated.View
      style={[
        s.wrap,
        {
          transform: [{ translateY: slide }],
          opacity,
          top: Platform.OS === "web" ? 8 : insets.top + 8,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={s.toast}
        onPress={onPress}
      >
        <P style={s.text}>{message}</P>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99999,
    pointerEvents: "box-none",
  },
  toast: {
    backgroundColor: "rgba(33, 33, 33, 0.92)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: 520,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 16px rgba(0,0,0,0.25)" as any }
      : { elevation: 6 }),
  },
  text: { color: "#fff", fontWeight: "600" },
});
