import { memo, useEffect } from "react";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { tv, type VariantProps } from "tailwind-variants";

const spinnerVariants = tv({
	base: "rounded-full border-2 border-muted border-t-primary",
	variants: {
		size: {
			sm: "h-4 w-4",
			md: "h-6 w-6",
			lg: "h-8 w-8 border-[3px]",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

type SpinnerProps = VariantProps<typeof spinnerVariants> & {
	className?: string;
};

export const Spinner = memo(function Spinner({ className, size }: SpinnerProps) {
	const rotation = useSharedValue(0);

	useEffect(() => {
		rotation.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1);
		return () => cancelAnimation(rotation);
	}, [rotation]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	return <Animated.View accessibilityRole="progressbar" style={animatedStyle} className={spinnerVariants({ size, className })} />;
});
