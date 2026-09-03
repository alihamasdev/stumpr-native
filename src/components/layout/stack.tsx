import { Platform, Pressable } from "react-native";
import { Stack as ExpoStack, useRouter, type NativeStackNavigationOptions } from "expo-router";
import { ChevronLeftIcon } from "panelui-native";

export const globalStackOptions: NativeStackNavigationOptions = {
	headerShadowVisible: false,
	headerTransparent: Platform.OS === "ios",
	headerStyle: { backgroundColor: Platform.OS === "ios" ? "transparent" : "black" },

	headerTitleAlign: "center",
	headerTitleStyle: {
		fontSize: 18,
		color: "#fff",
		fontFamily: "Outfit_600SemiBold",
	},

	headerBackVisible: true,
	headerBackButtonDisplayMode: "minimal",
};

export function BackButton() {
	const router = useRouter();
	return (
		<Pressable onPress={() => router.back()} hitSlop={8}>
			<ChevronLeftIcon size={24} />
		</Pressable>
	);
}

export function StackRoot({ screenOptions, ...props }: React.ComponentProps<typeof ExpoStack>) {
	return (
		<ExpoStack
			screenOptions={{
				...globalStackOptions,
				headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
				...screenOptions,
			}}
			{...props}
		/>
	);
}

export const Stack = Object.assign(StackRoot, {
	Screen: ExpoStack.Screen,
});
