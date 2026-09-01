import { Stack } from "expo-router";

import { globalStackOptions } from "@/constants/navigation";

export default function MatchesLayout() {
	return (
		<Stack screenOptions={globalStackOptions}>
			<Stack.Screen name="index" options={{ title: "Matches" }} />
		</Stack>
	);
}
