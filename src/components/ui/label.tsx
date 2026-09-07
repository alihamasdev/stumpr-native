import { createContext, forwardRef, useContext, useMemo, type ReactNode } from "react";
import { View, type Text as RNText, type ViewProps } from "react-native";
import { tv } from "tailwind-variants";

import { Text, textChildren, type TextProps } from "@/components/ui/text";

const labelVariants = tv({
	slots: {
		root: "flex-row items-center gap-1",
		text: "text-sm font-medium text-foreground",
		asterisk: "text-sm font-medium text-destructive",
	},
	variants: {
		isDisabled: {
			true: {
				root: "opacity-[0.64]",
				asterisk: "text-muted-foreground",
			},
		},
		isInvalid: {
			true: {
				text: "text-destructive",
			},
		},
	},
});

type LabelState = {
	isRequired: boolean;
	isInvalid: boolean;
	isDisabled: boolean;
};

const LabelContext = createContext<LabelState>({
	isRequired: false,
	isInvalid: false,
	isDisabled: false,
});

type LabelProps = ViewProps & {
	className?: string;
	isRequired?: boolean;
	isInvalid?: boolean;
	isDisabled?: boolean;
	children?: ReactNode;
};

const LabelRoot = forwardRef<View, LabelProps>(({ className, isRequired = false, isInvalid = false, isDisabled = false, children, ...props }, ref) => {
	const { root } = labelVariants({ isDisabled, isInvalid });
	const state = useMemo(() => ({ isRequired, isInvalid, isDisabled }), [isRequired, isInvalid, isDisabled]);

	return (
		<LabelContext.Provider value={state}>
			<View ref={ref} {...props} className={root({ className })} accessibilityState={{ disabled: isDisabled }}>
				{/* Bare strings are the common case — wrap them so callers don't have to. */}
				{textChildren(children, (text) => (
					<LabelText>{text}</LabelText>
				))}
			</View>
		</LabelContext.Provider>
	);
});
LabelRoot.displayName = "Label";

type LabelTextProps = TextProps & {
	className?: string;
	asteriskClassName?: string;
};

const LabelText = forwardRef<RNText, LabelTextProps>(({ className, asteriskClassName, children, ...props }, ref) => {
	const { isRequired, isInvalid, isDisabled } = useContext(LabelContext);
	const { text, asterisk } = labelVariants({ isDisabled, isInvalid });

	return (
		<>
			<Text ref={ref} className={text({ className })} {...props}>
				{children}
			</Text>
			{isRequired ? (
				<Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className={asterisk({ className: asteriskClassName })}>
					*
				</Text>
			) : null}
		</>
	);
});
LabelText.displayName = "Label.Text";

export const Label = Object.assign(LabelRoot, {
	Text: LabelText,
});
