import { Stack } from "@/components/layout/stack";

export default function BowlingStatsLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Bowling Stats" }} />
		</Stack>
	);
}
