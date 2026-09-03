import { Link } from "expo-router";
import { Button } from "panelui-native";
import Animated from "react-native-reanimated";

export default function SettingssScreen() {
	return (
		<Animated.ScrollView className="flex flex-1 bg-background" contentContainerClassName="gap-2 p-2">
			<Link href="/(stats)/batting" asChild>
				<Button variant="secondary">Batting Stats</Button>
			</Link>
			<Link href="/(stats)/bowling" asChild>
				<Button variant="secondary">Bowling Stats</Button>
			</Link>
			<Link href="/(stats)/fielding" asChild>
				<Button variant="secondary">Fielding Stats</Button>
			</Link>
			<Link href="/(stats)/potm" asChild>
				<Button variant="secondary">Player of the Match Stats</Button>
			</Link>
		</Animated.ScrollView>
	);
}
