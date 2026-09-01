import "../global.css";

import { ActivityIndicator, useColorScheme, View } from "react-native";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from "@expo-google-fonts/outfit";
import { useFonts } from "expo-font";
import { PanelUIProvider } from "panelui-native";

import { globalStackOptions } from "@/constants/navigation";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		Outfit_400Regular,
		Outfit_500Medium,
		Outfit_600SemiBold,
		Outfit_700Bold,
		Outfit_800ExtraBold,
	});

	if (!loaded) return null;

	return (
		<PanelUIProvider>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack screenOptions={globalStackOptions}>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				</Stack>
			</ThemeProvider>
		</PanelUIProvider>
	);
}

export function SuspenseFallback() {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<ActivityIndicator size="large" />
		</View>
	);
}
