import "../global.css";

import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from "@expo-google-fonts/outfit";
import { useFonts } from "expo-font";
import { PanelUIProvider } from "panelui-native";

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
				<Stack />
			</ThemeProvider>
		</PanelUIProvider>
	);
}
