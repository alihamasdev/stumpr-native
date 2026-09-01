import { Platform } from "react-native";
import { type NativeStackNavigationOptions } from "expo-router";

export const globalStackOptions: NativeStackNavigationOptions = {
	animation: "slide_from_right",
	headerTransparent: Platform.OS === "ios",
	headerTitleAlign: "center",
	headerTitleStyle: {
		fontFamily: "Outfit_600SemiBold",
		fontSize: 18,
	},
	headerBackButtonDisplayMode: "minimal",
};
