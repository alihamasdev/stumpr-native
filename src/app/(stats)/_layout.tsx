import { Platform } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function StatsLayout() {
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
			<NativeTabs.Trigger name="batting">
				<NativeTabs.Trigger.Label>Batting</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="figure.cricket" md="sports_cricket" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="bowling">
				<NativeTabs.Trigger.Label>Bowling</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="baseball" md="sports_baseball" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="fielding">
				<NativeTabs.Trigger.Label>Fielding</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="hand.raised.fill" md="sports_handball" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="potm">
				<NativeTabs.Trigger.Label>POTM</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="trophy.fill" md="emoji_events" />
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
