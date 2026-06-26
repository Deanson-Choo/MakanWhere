import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="recco_me"
        options={{
          title: "Recco Me",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="thumbs-up" size={size} color={color} />
          ),
        }}
      /> 

      <Tabs.Screen
        name="recco_us"
        options={{
          title: "Recco Us",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="thumbs-up" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
};

export default TabLayout;