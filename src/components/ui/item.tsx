import { createContext, forwardRef, useContext } from "react";
import { View, type ViewProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";
import { AnimatedPressable, type AnimatedPressableProps } from "@/components/ui/animated-pressable";
import { Text, textChildren, type TextProps } from "@/components/ui/text";

type ItemSize = "default" | "sm" | "xs";
type ItemOrientation = "horizontal" | "vertical";

const itemVariants = tv({
	slots: {
		root: "gap-3 rounded-xl",
		title: "font-medium text-foreground",
		description: "text-muted-foreground",
	},
	variants: {
		variant: {
			default: {},
			outline: { root: "border border-border" },
			muted: { root: "bg-muted" },
		},
		size: {
			default: { root: "p-4", title: "text-base", description: "text-sm" },
			sm: { root: "p-3", title: "text-sm", description: "text-xs" },
			xs: { root: "gap-2 p-2", title: "text-sm", description: "text-xs" },
		},
		orientation: {
			/** Media, text and actions side by side — the list-row shape. */
			horizontal: { root: "w-full flex-row items-center" },
			/** Stacked into a card — the shape a horizontal carousel wants. */
			vertical: { root: "flex-col items-start" },
		},
		disabled: {
			true: { root: "opacity-[0.64]" },
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
		orientation: "horizontal",
	},
});

const ItemContext = createContext<{ size: ItemSize; orientation: ItemOrientation }>({
	size: "default",
	orientation: "horizontal",
});

const mediaVariants = tv({
	base: "shrink-0 items-center justify-center",
	variants: {
		variant: {
			/** No box — for an Avatar or anything that styles itself. */
			default: "",
			/** Rounded square tile sized for an icon. */
			icon: "rounded-lg border border-border bg-muted",
			/** Clipped frame for an image or thumbnail. */
			image: "overflow-hidden rounded-lg bg-muted",
		},
		size: {
			default: "",
			sm: "",
			xs: "",
		},
	},
	compoundVariants: [
		{ variant: "icon", size: "default", class: "h-10 w-10" },
		{ variant: "icon", size: "sm", class: "h-8 w-8" },
		{ variant: "icon", size: "xs", class: "h-6 w-6" },
		{ variant: "image", size: "default", class: "h-12 w-12" },
		{ variant: "image", size: "sm", class: "h-10 w-10" },
		{ variant: "image", size: "xs", class: "h-8 w-8" },
	],
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

type ItemProps = Omit<AnimatedPressableProps, "children" | "disabled"> &
	Omit<VariantProps<typeof itemVariants>, "disabled"> & {
		className?: string;
		disabled?: boolean;
		size?: ItemSize;
		orientation?: ItemOrientation;
		children?: React.ReactNode;
	};

const ItemRoot = forwardRef<View, ItemProps>(
	({ className, variant, size = "default", orientation = "horizontal", disabled, children, onPress, ...props }, ref) => {
		const { root } = itemVariants({ variant, size, orientation, disabled: !!disabled });

		const body = !onPress ? (
			<View ref={ref} {...(props as ViewProps)} accessibilityState={{ disabled: !!disabled }} className={root({ className })}>
				{textChildren(children)}
			</View>
		) : (
			<AnimatedPressable
				ref={ref}
				{...props}
				accessibilityRole="button"
				accessibilityState={{ disabled: !!disabled }}
				disabled={disabled}
				onPress={onPress}
				className={root({ className })}
			>
				{textChildren(children)}
			</AnimatedPressable>
		);

		return <ItemContext.Provider value={{ size, orientation }}>{body}</ItemContext.Provider>;
	},
);
ItemRoot.displayName = "Item";

type ItemGroupProps = ViewProps & {
	className?: string;
	orientation?: ItemOrientation;
	children?: React.ReactNode;
};

const ItemGroup = forwardRef<View, ItemGroupProps>(({ className, orientation = "vertical", children, ...props }, ref) => (
	<View ref={ref} accessibilityRole="list" className={cn(orientation === "horizontal" ? "flex-row items-stretch gap-3" : "w-full", className)} {...props}>
		{textChildren(children)}
	</View>
));
ItemGroup.displayName = "Item.Group";

type ItemSeparatorProps = ViewProps & {
	className?: string;
	orientation?: ItemOrientation;
};

/** Hairline between rows in a group. */
const ItemSeparator = forwardRef<View, ItemSeparatorProps>(({ className, orientation = "vertical", ...props }, ref) => (
	<View ref={ref} className={cn(orientation === "horizontal" ? "h-full w-px" : "h-px w-full", "bg-border", className)} {...props} />
));
ItemSeparator.displayName = "Item.Separator";

type ItemMediaProps = ViewProps &
	VariantProps<typeof mediaVariants> & {
		className?: string;
		children?: React.ReactNode;
	};

const ItemMedia = forwardRef<View, ItemMediaProps>(({ className, variant, size, children, ...props }, ref) => {
	const item = useContext(ItemContext);

	return (
		<View ref={ref} className={mediaVariants({ variant, size: size ?? item.size, className })} {...props}>
			{textChildren(children)}
		</View>
	);
});
ItemMedia.displayName = "Item.Media";

type ItemContentProps = ViewProps & {
	className?: string;
	children?: React.ReactNode;
};

const ItemContent = forwardRef<View, ItemContentProps>(({ className, children, ...props }, ref) => {
	const { orientation } = useContext(ItemContext);

	return (
		<View ref={ref} className={cn(orientation === "horizontal" ? "flex-1" : "w-full", "gap-0.5", className)} {...props}>
			{textChildren(children)}
		</View>
	);
});
ItemContent.displayName = "Item.Content";

type ItemTitleProps = TextProps & {
	className?: string;
};

const ItemTitle = forwardRef<React.ElementRef<typeof Text>, ItemTitleProps>(({ className, ...props }, ref) => {
	const { size } = useContext(ItemContext);
	const { title } = itemVariants({ size });

	return <Text ref={ref} className={title({ className })} {...props} />;
});
ItemTitle.displayName = "Item.Title";

type ItemDescriptionProps = TextProps & {
	className?: string;
};

const ItemDescription = forwardRef<React.ElementRef<typeof Text>, ItemDescriptionProps>(({ className, ...props }, ref) => {
	const { size } = useContext(ItemContext);
	const { description } = itemVariants({ size });

	return <Text ref={ref} className={description({ className })} {...props} />;
});
ItemDescription.displayName = "Item.Description";

type ItemActionsProps = ViewProps & {
	className?: string;
	children?: React.ReactNode;
};

const ItemActions = forwardRef<View, ItemActionsProps>(({ className, children, ...props }, ref) => (
	<View ref={ref} className={cn("shrink-0 flex-row items-center gap-1.5", className)} {...props}>
		{textChildren(children)}
	</View>
));
ItemActions.displayName = "Item.Actions";

type ItemHeaderProps = ViewProps & {
	className?: string;
	children?: React.ReactNode;
};

const ItemHeader = forwardRef<View, ItemHeaderProps>(({ className, children, ...props }, ref) => (
	<View ref={ref} className={cn("w-full flex-row items-center justify-between gap-2", className)} {...props}>
		{textChildren(children)}
	</View>
));
ItemHeader.displayName = "Item.Header";

type ItemFooterProps = ViewProps & {
	className?: string;
	children?: React.ReactNode;
};

const ItemFooter = forwardRef<View, ItemFooterProps>(({ className, children, ...props }, ref) => (
	<View ref={ref} className={cn("w-full flex-row items-center gap-2", className)} {...props}>
		{textChildren(children)}
	</View>
));
ItemFooter.displayName = "Item.Footer";

export const Item = Object.assign(ItemRoot, {
	Group: ItemGroup,
	Separator: ItemSeparator,
	Media: ItemMedia,
	Content: ItemContent,
	Title: ItemTitle,
	Description: ItemDescription,
	Actions: ItemActions,
	Header: ItemHeader,
	Footer: ItemFooter,
});
