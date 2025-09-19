import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AuthLogin from "../screens/AuthLogin";
import AuthRegister from "../screens/AuthRegister";
import AuthVerifyEmail from "../screens/AuthVerifyEmail";
import ForgotPassword from "../screens/ForgotPassword";
import ResetPassword from "../screens/ResetPassword";

import Feed from "../screens/Feed";
import Events from "../screens/Events";
import Groups from "../screens/Groups";
import Messages from "../screens/Messages";
import Profile from "../screens/Profile";
import Help from "../screens/Help";

import CompleteProfile from "../screens/CompleteProfile";
import EditProfile from "../screens/EditProfile";

import { useSession } from "../auth/AuthProvider";

const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen name="Events" component={Events} />
      <Tab.Screen name="Groups" component={Groups} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Help" component={Help} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, loading, recovery } = useSession();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {recovery ? (
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
      ) : session ? (
        <Stack.Group>
          <Stack.Screen name="App" component={Tabs} />
          <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Login" component={AuthLogin} />
          <Stack.Screen name="Register" component={AuthRegister} />
          <Stack.Screen name="VerifyEmail" component={AuthVerifyEmail} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
