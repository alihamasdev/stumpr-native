import { Stack } from "@/components/layout/stack";

export default function BattingStatsLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Batting Stats" }} />
		</Stack>
	);
}
