import { Platform } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
	return (
		<NativeTabs
			backBehavior="none"
			labelVisibilityMode="labeled"
			rippleColor="transparent"
			indicatorColor="#bd0622"
			backgroundColor={Platform.OS === "ios" ? "transparent" : "black"}
			labelStyle={{
				fontFamily: "Outfit_500Medium",
				default: { color: "#fff" },
				selected: { color: Platform.OS === "ios" ? "#bd0622" : "#fff" },
			}}
			iconColor={{
				default: "white",
				selected: Platform.OS === "android" ? "#ffff" : "#bd0622",
			}}
		>
			<NativeTabs.Trigger name="matches">
				<NativeTabs.Trigger.Label>Matches</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="soccerball" md="sports_football" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="teams">
				<NativeTabs.Trigger.Icon sf="person.2.fill" md="group" />
				<NativeTabs.Trigger.Label>Teams</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="players">
				<NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="person" />
				<NativeTabs.Trigger.Label>Players</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="settings">
				<NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
				<NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
