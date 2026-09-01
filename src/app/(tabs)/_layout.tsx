import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="matches">
				<NativeTabs.Trigger.Label>Matches</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="soccerball" md="sports_football" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="stats">
				<NativeTabs.Trigger.Icon sf="chart.xyaxis.line" md="settings" />
				<NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="teams">
				<NativeTabs.Trigger.Icon sf="person.2.fill" md="group" />
				<NativeTabs.Trigger.Label>Teams</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="players">
				<NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="person" />
				<NativeTabs.Trigger.Label>Players</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
