import { Stack } from "@/components/layout/stack";

export default function PlayersLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Players" }} />
		</Stack>
	);
}
