import { Stack } from "@/components/layout/stack";

export default function TeamsLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Teams" }} />
		</Stack>
	);
}
