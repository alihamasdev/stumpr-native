import { Avatar, Item } from "panelui-native";
import Animated from "react-native-reanimated";

export default function TeamsScreen() {
	return (
		<Animated.ScrollView className="flex flex-1 bg-background" contentContainerClassName="gap-2 p-2">
			<Item variant="muted">
				<Avatar fallback="HA" />
				<Item.Content className="gap-0">
					<Item.Title>Hamza XI</Item.Title>
					<Item.Description>HXI</Item.Description>
				</Item.Content>
			</Item>

			<Item variant="muted">
				<Avatar fallback="AH" />
				<Item.Content className="gap-0">
					<Item.Title>Nadeem XI</Item.Title>
					<Item.Description>NXI</Item.Description>
				</Item.Content>
			</Item>

			<Item variant="muted">
				<Avatar fallback="WA" />
				<Item.Content className="gap-0">
					<Item.Title>Married</Item.Title>
					<Item.Description>MARR</Item.Description>
				</Item.Content>
			</Item>
		</Animated.ScrollView>
	);
}
