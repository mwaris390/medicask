import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import { useFonts } from "expo-font";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Logo = require("@/assets/icons/medicine.png");

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  if (!loaded && !error) {
    return null;
  }

  const logoTitle = () => {
    return (
      <View style={styles.logo}>
        <Image
          source={Logo}
          resizeMode="contain"
          style={{
            width: 32,
            height: 32,
          }}
        />
        {/* <AntDesign name="dingding" size={28} color="#f1fbfc" /> */}
        <Text style={styles.logoText}>MedicAsk</Text>
      </View>
    );
  };

  return (
    <>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#39c3d1" }}
          edges={["top"]}
        >
          <StatusBar style={"auto"} />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#39c3d1",
              },
              contentStyle: {
                backgroundColor: "#f1fbfc",
                paddingHorizontal: 20,
                paddingBottom: 20,
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerTitle: logoTitle }} />
          </Stack>
          <Toast />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#39c3d1",
  },
  logo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f1fbfc",
    fontFamily: "Poppins-Bold",
  },
});
