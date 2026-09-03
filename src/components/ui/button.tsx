import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Button as ButtonPrimitive, ChevronLeftIcon, cn } from "panelui-native";

export function Button({ native = false, className, ...props }: React.ComponentProps<typeof ButtonPrimitive>) {
	return <ButtonPrimitive className={cn("rounded-full", className)} native={native} {...props} />;
}

export function BackButton() {
	const router = useRouter();
	return (
		<Pressable onPress={() => router.back()}>
			<ChevronLeftIcon size={24} />
		</Pressable>
	);
}
