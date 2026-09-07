import { Children, forwardRef, type ReactNode } from "react";
import { View, type Text as RNText, type ViewProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";
import { Text, textChildren, type TextProps } from "@/components/ui/text";

const typographyVariants = tv({
	base: "text-foreground",
	variants: {
		type: {
			h1: "text-4xl font-bold tracking-tight",
			h2: "text-3xl font-semibold tracking-tight",
			h3: "text-2xl font-semibold tracking-tight",
			h4: "text-xl font-semibold",
			h5: "text-lg font-semibold",
			h6: "text-base font-semibold",
			/** The sentence under a heading, set larger and quieter than body. */
			lead: "text-xl font-normal text-muted-foreground",
			body: "text-base font-normal",
			"body-sm": "text-sm font-normal",
			"body-xs": "text-xs font-normal",
			/** Body, one step up — for a number or a name that carries the row. */
			large: "text-lg font-semibold",
			/** Body, one step down and tighter — captions, footnotes, meta. */
			small: "text-sm font-medium leading-none",
			blockquote: "text-base font-normal italic",
			code: "font-mono text-sm text-foreground",
		},
		weight: {
			normal: "font-normal",
			medium: "font-medium",
			semibold: "font-semibold",
			bold: "font-bold",
			extrabold: "font-extrabold",
		},
		align: {
			// `start` and `end` follow the reading direction; `left` and `right`
			// are the physical edges, for the rare line that has to stay put
			// whichever way the script runs — a figure in a table, a code caption.
			start: "text-start",
			end: "text-end",
			left: "text-left",
			center: "text-center",
			right: "text-right",
		},
		transform: {
			uppercase: "uppercase",
			lowercase: "lowercase",
			capitalize: "capitalize",
		},
		underline: {
			true: "underline",
		},
		italic: {
			true: "italic",
		},
		strike: {
			true: "line-through",
		},
		muted: {
			true: "text-muted-foreground",
		},
	},
	defaultVariants: {
		type: "body",
	},
});

export type TypographyType = NonNullable<VariantProps<typeof typographyVariants>["type"]>;

export type TypographyWeight = NonNullable<VariantProps<typeof typographyVariants>["weight"]>;

export type TypographyProps = Omit<TextProps, "size" | "weight"> &
	VariantProps<typeof typographyVariants> & {
		className?: string;
		weight?: TypographyWeight;
		underline?: boolean;
		italic?: boolean;
		strike?: boolean;
		align?: "left" | "center" | "right";
		transform?: "uppercase" | "lowercase" | "capitalize";
	};

type HeadingType = Extract<TypographyType, "h1" | "h2" | "h3" | "h4" | "h5" | "h6">;

type ParagraphType = Extract<TypographyType, "body" | "body-sm" | "body-xs" | "lead" | "large" | "small">;

const HEADING_LEVEL: Record<HeadingType, number> = {
	h1: 1,
	h2: 2,
	h3: 3,
	h4: 4,
	h5: 5,
	h6: 6,
};

const TypographyRoot = forwardRef<RNText, TypographyProps>(({ className, type, muted, weight, align, transform, underline, italic, strike, ...props }, ref) => (
	<Text
		ref={ref}
		className={typographyVariants({
			type,
			muted,
			weight,
			align,
			transform,
			underline,
			italic,
			strike,
			className,
		})}
		{...props}
	/>
));
TypographyRoot.displayName = "Typography";

export type TypographyHeadingProps = Omit<TypographyProps, "type"> & {
	type?: HeadingType;
};

/** Heading text, wired up with the matching accessibility heading level. */
const TypographyHeading = forwardRef<RNText, TypographyHeadingProps>(
	({ className, type = "h2", muted, weight, align, transform, underline, italic, strike, ...props }, ref) => (
		<Text
			ref={ref}
			accessibilityRole="header"
			aria-level={HEADING_LEVEL[type]}
			className={typographyVariants({
				type,
				muted,
				weight,
				align,
				transform,
				underline,
				italic,
				strike,
				className,
			})}
			{...props}
		/>
	),
);
TypographyHeading.displayName = "Typography.Heading";

export type TypographyParagraphProps = Omit<TypographyProps, "type"> & {
	type?: ParagraphType;
};

const TypographyParagraph = forwardRef<RNText, TypographyParagraphProps>(
	({ className, type = "body", muted, weight, align, transform, underline, italic, strike, ...props }, ref) => (
		<Text
			ref={ref}
			className={typographyVariants({
				type,
				muted,
				weight,
				align,
				transform,
				underline,
				italic,
				strike,
				className,
			})}
			{...props}
		/>
	),
);
TypographyParagraph.displayName = "Typography.Paragraph";

export type TypographyCodeProps = Omit<TypographyProps, "type"> & {
	/** Classes for the surface behind the code text. */
	containerClassName?: string;
};

/** Inline code on a muted surface. */
const TypographyCode = forwardRef<View, TypographyCodeProps & Pick<ViewProps, "testID">>(({ className, containerClassName, muted, testID, ...props }, ref) => (
	<View ref={ref} testID={testID} className={cn("self-start rounded-md bg-muted px-1.5 py-1", containerClassName)}>
		<Text className={typographyVariants({ type: "code", muted, className })} {...props} />
	</View>
));
TypographyCode.displayName = "Typography.Code";

export type TypographyBlockquoteProps = Omit<TypographyProps, "type"> & {
	/** Classes for the row that carries the rule. */
	containerClassName?: string;
};

/**
 * A quotation, marked by a rule down its leading edge.
 *
 * The rule uses `border-s`, so it moves to the right-hand side under a
 * right-to-left `Direction` without the quote having to know.
 */
const TypographyBlockquote = forwardRef<View, TypographyBlockquoteProps>(
	({ className, containerClassName, muted, weight, align, transform, underline, italic = true, strike, children, ...props }, ref) => (
		<View ref={ref} className={cn("border-s-2 border-border ps-4", containerClassName)}>
			<Text
				className={typographyVariants({
					type: "blockquote",
					muted,
					weight,
					align,
					transform,
					underline,
					italic,
					strike,
					className,
				})}
				{...props}
			>
				{children}
			</Text>
		</View>
	),
);
TypographyBlockquote.displayName = "Typography.Blockquote";

export type TypographyListProps = ViewProps & {
	className?: string;
	ordered?: boolean;
	children?: ReactNode;
};

/**
 * A bulleted or numbered list.
 *
 * React Native has no list markers at all, so each row is a marker and a text
 * block side by side. The marker is drawn here rather than in the item, because
 * only the list knows whether it is a bullet or a number — and only the list
 * knows which number.
 */
const TypographyList = forwardRef<View, TypographyListProps>(({ className, ordered = false, children, ...props }, ref) => (
	<View ref={ref} {...props} accessibilityRole="list" className={cn("gap-2", className)}>
		{Children.map(children, (child, index) => (
			<View role="listitem" className="w-full flex-row gap-2">
				{ordered ? (
					<Text className="text-base text-muted-foreground">{index + 1}.</Text>
				) : (
					// A dot rather than "•": the character's size and baseline vary by
					// platform font, and a view does not.
					<View className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
				)}
				<View className="flex-1">{textChildren(child)}</View>
			</View>
		))}
	</View>
));
TypographyList.displayName = "Typography.List";

export type TypographyListItemProps = Omit<TypographyProps, "type"> & {
	type?: ParagraphType;
};

/** One line of a list. The marker beside it belongs to the list. */
const TypographyListItem = forwardRef<RNText, TypographyListItemProps>(
	({ className, type = "body", muted, weight, align, transform, underline, italic, strike, ...props }, ref) => (
		<Text
			ref={ref}
			className={typographyVariants({
				type,
				muted,
				weight,
				align,
				transform,
				underline,
				italic,
				strike,
				className,
			})}
			{...props}
		/>
	),
);
TypographyListItem.displayName = "Typography.ListItem";

export const Typography = Object.assign(TypographyRoot, {
	Heading: TypographyHeading,
	Paragraph: TypographyParagraph,
	Code: TypographyCode,
	Blockquote: TypographyBlockquote,
	List: TypographyList,
	ListItem: TypographyListItem,
});
