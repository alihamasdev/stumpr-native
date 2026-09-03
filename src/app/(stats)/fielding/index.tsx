import { Avatar, Item } from "panelui-native";
import Animated from "react-native-reanimated";

export default function FieldingStatsScreen() {
	return (
		<Animated.ScrollView className="flex flex-1 bg-background" contentContainerClassName="gap-2 p-2">
			<Item variant="muted">
				<Avatar fallback="HA" />
				<Item.Content className="gap-0">
					<Item.Title>Hamas</Item.Title>
					<Item.Description>Batsman</Item.Description>
				</Item.Content>
			</Item>

			<Item variant="muted">
				<Avatar fallback="AH" />
				<Item.Content className="gap-0">
					<Item.Title>Ahsan</Item.Title>
					<Item.Description>Batsman</Item.Description>
				</Item.Content>
			</Item>

			<Item variant="muted">
				<Avatar fallback="WA" />
				<Item.Content className="gap-0">
					<Item.Title>Waleed</Item.Title>
					<Item.Description>Batsman</Item.Description>
				</Item.Content>
			</Item>
		</Animated.ScrollView>
	);
}
