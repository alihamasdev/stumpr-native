import { Children, cloneElement, createContext, isValidElement, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View, type LayoutChangeEvent } from "react-native";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react-native";
import { BottomSheet, InputGroup, Portal, useBackHandler } from "panelui-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { tv } from "tailwind-variants";
import { useCSSVariable } from "uniwind";

import { cn } from "@/lib/utils";
import { Text, textChildren } from "@/components/ui/text";

const selectVariants = tv({
	slots: {
		trigger: "w-full flex-row items-center justify-between gap-3 rounded-lg border border-input bg-background px-4 py-3.5",
		triggerLabel: "flex-1 text-base font-medium text-foreground",
		placeholder: "flex-1 text-base text-muted-foreground",
		list: "overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-sm",
		// The block of options inside a sheet. The sheet is the surface there, so
		// this is what `listClassName` has to reach instead of `list`.
		options: "gap-1 pb-2",
		search: "pb-2",
		empty: "px-3 py-6 text-center text-sm text-muted-foreground",
		item: "flex-row items-center gap-2 rounded-lg px-3 py-3",
		itemLabel: "flex-1 text-base font-medium text-foreground",
		itemIndicator: "h-5 w-5 items-center justify-center",
		group: "gap-1",
		groupLabel: "px-3 pb-1 pt-2",
	},
	variants: {
		selected: {
			true: { item: "bg-accent" },
		},
		disabled: {
			true: { trigger: "opacity-[0.64]" },
		},
		itemDisabled: {
			true: { item: "opacity-[0.64]" },
		},
		presentation: {
			sheet: {},
			inline: { list: "mt-2" },
			overlay: { list: "shadow-lg" },
		},
	},
	defaultVariants: {
		presentation: "sheet",
	},
});

type SelectPresentation = "sheet" | "inline" | "overlay";

type SelectContextValue = {
	value: string | undefined;
	onSelect: (value: string) => void;
	query: string;
	setQuery: (query: string) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

/**
 * The filter field's text, from inside an open Select.
 *
 * Select can only filter the options it renders itself. A caller who hands it
 * a virtualized list is rendering their own rows, from their own data, and
 * this is how they get the query to filter that data with — `Select.Item`
 * still works wherever those rows put it, because selection travels by
 * context rather than by position.
 *
 * ```tsx
 * function Options() {
 *   const { query } = useSelectSearch();
 *   const rows = useMemo(() => filter(timezones, query), [query]);
 *   return (
 *     <FlashList
 *       data={rows}
 *       renderItem={({ item }) => <Select.Item value={item.id} label={item.name} />}
 *     />
 *   );
 * }
 * ```
 *
 * `setQuery` is there for a caller who wants to clear or seed the field.
 */
export function useSelectSearch(): { query: string; setQuery: (query: string) => void } {
	const context = useContext(SelectContext);
	if (!context) {
		throw new Error("useSelectSearch must be used within a <Select>");
	}
	return { query: context.query, setQuery: context.setQuery };
}

type SelectItemProps = {
	value: string;
	label: string;
	className?: string;
	labelClassName?: string;
	disabled?: boolean;
};

function SelectItem({ value, label, disabled, className, labelClassName }: SelectItemProps) {
	const context = useContext(SelectContext);
	if (!context) {
		throw new Error("Select.Item must be used within a <Select>");
	}

	const selected = context.value === value;
	const { item, itemLabel, itemIndicator } = selectVariants({
		selected,
		itemDisabled: !!disabled,
	});
	const checkColor = useCSSVariable("--color-muted-foreground");

	return (
		<Pressable
			accessibilityRole="menuitem"
			accessibilityState={{ selected, disabled: !!disabled }}
			disabled={disabled}
			onPress={() => context.onSelect(value)}
			className={item({ className })}
		>
			<Text className={itemLabel({ className: labelClassName })}>{label}</Text>
			<View className={itemIndicator()}>{selected ? <CheckIcon size={16} color={typeof checkColor === "string" ? checkColor : "#737373"} /> : null}</View>
		</Pressable>
	);
}
SelectItem.displayName = "Select.Item";

export type SelectGroupProps = {
	label?: string;
	className?: string;
	labelClassName?: string;
	children: React.ReactNode;
};

function SelectGroup({ label, className, labelClassName, children }: SelectGroupProps) {
	const { group, groupLabel } = selectVariants();

	return (
		<View className={cn(group(), className)}>
			{label ? (
				<View accessibilityRole="header" className={cn(groupLabel(), labelClassName)}>
					<Text size="xs" weight="medium" muted className="tracking-wide uppercase">
						{label}
					</Text>
				</View>
			) : null}
			{textChildren(children)}
		</View>
	);
}
SelectGroup.displayName = "Select.Group";

/**
 * Walk the declared children, visiting every `Select.Item` — including the ones
 * nested inside a `Select.Group`.
 *
 * Grouping is a rendering concern, but the selected label and the native
 * picker's option list both want the flat set, so the tree is flattened once
 * here rather than in each of them.
 */
function eachOption(children: React.ReactNode, visit: (option: SelectItemProps) => void) {
	Children.forEach(children, (child) => {
		if (!isValidElement(child)) return;
		if (child.type === SelectGroup) {
			eachOption((child.props as SelectGroupProps).children, visit);
			return;
		}
		if (child.type !== SelectItem) return;
		const { value, label, disabled } = child.props as SelectItemProps;
		visit({ value, label, disabled });
	});
}

/** What a pass of the filter left, and how much there was to filter. */
type FilterResult = {
	kept: React.ReactNode[];
	seen: number;
};

/**
 * The children a query leaves standing.
 *
 * A group is rebuilt around whatever survives inside it and dropped when that
 * is nothing — a heading with no options under it reads as a section that
 * failed to load rather than one the filter emptied.
 *
 * Anything that is neither an item nor a group is left alone: a caption or a
 * divider the caller put in the list is not something a filter has an opinion
 * about, and neither is a list component rendering its own rows. Dropping
 * those was how a `Select.Item` inside a virtualized list disappeared the
 * moment anybody typed — the list was not an item, so nothing kept it.
 *
 * `seen` is what tells an empty result from an unfilterable one. Zero items
 * seen means the caller is rendering their own rows and filtering them
 * themselves through `useSelectSearch`, so there is nothing to call empty.
 */
function filterOptions(children: React.ReactNode, needle: string): FilterResult {
	const kept: React.ReactNode[] = [];
	let seen = 0;

	Children.forEach(children, (child) => {
		if (!isValidElement(child)) {
			if (child !== null && child !== undefined && child !== false) kept.push(child);
			return;
		}

		if (child.type === SelectGroup) {
			const props = child.props as SelectGroupProps;
			const inner = filterOptions(props.children, needle);
			seen += inner.seen;
			if (inner.kept.length) {
				kept.push(cloneElement(child as React.ReactElement<SelectGroupProps>, {}, inner.kept));
			}
			return;
		}

		if (child.type === SelectItem) {
			seen += 1;
			const { label } = child.props as SelectItemProps;
			if (label.toLowerCase().includes(needle)) kept.push(child);
			return;
		}

		kept.push(child);
	});

	return { kept, seen };
}

/** Trigger frame in window coordinates, measured when the list opens. */
type Anchor = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type SelectProps = {
	value?: string;
	onValueChange: (value: string) => void;
	onOpenChange?: (open: boolean) => void;
	valueLabel?: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	triggerClassName?: string;
	valueClassName?: string;
	placeholderClassName?: string;
	listClassName?: string;
	searchClassName?: string;
	searchInputClassName?: string;
	searchContainerClassName?: string;
	emptyClassName?: string;
	presentation?: SelectPresentation;
	title?: string;
	contentWidth?: "trigger" | "content" | number;
	offset?: number;
	searchable?: boolean;
	searchPlaceholder?: string;
	emptyMessage?: string;
	children: React.ReactNode;
};

function SelectRoot({
	className,
	value,
	valueLabel,
	onValueChange,
	placeholder = "Select an option",
	disabled,
	triggerClassName,
	valueClassName,
	placeholderClassName,
	listClassName,
	searchClassName,
	searchInputClassName,
	searchContainerClassName,
	emptyClassName,
	presentation = "sheet",
	title,
	contentWidth = "trigger",
	offset = 8,
	onOpenChange,
	searchable = false,
	searchPlaceholder = "Search",
	emptyMessage = "No matches",
	children,
}: SelectProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [anchor, setAnchor] = useState<Anchor | null>(null);
	const [listHeight, setListHeight] = useState(0);
	const triggerRef = useRef<View>(null);
	const chevron = useSharedValue(0);
	const { height: screenHeight } = useWindowDimensions();

	const options = useMemo(() => {
		const collected: SelectItemProps[] = [];
		eachOption(children, (option) => collected.push(option));
		return collected;
	}, [children]);

	const selectedLabel = useMemo(() => valueLabel ?? options.find((option) => option.value === value)?.label, [options, value, valueLabel]);

	/*
	 * The options the filter leaves standing, or null when nothing is being
	 * filtered — which is the common case, and the one that must not pay for the
	 * feature. `null` means "render the children as given", so an unsearched
	 * Select does no per-option work at all.
	 */
	const filtered = useMemo(() => {
		const needle = searchable ? query.trim().toLowerCase() : "";
		if (!needle) return null;

		return filterOptions(children, needle);
	}, [children, query, searchable]);

	/*
	 * Nothing left, out of something there was. A caller rendering their own
	 * rows filters them themselves, so `seen` is zero and their list stands —
	 * saying "no matches" over the top of it would be Select claiming to know an
	 * answer it was never shown.
	 */
	const noMatches = filtered !== null && filtered.seen > 0 && filtered.kept.length === 0;

	const close = useCallback(() => {
		chevron.value = withTiming(0, { duration: 160 });
		setOpen(false);
		onOpenChange?.(false);
		// A filter left behind would be waiting the next time the list opens, with
		// most of the options missing and no obvious reason why.
		setQuery("");
	}, [chevron, onOpenChange]);

	// An open overlay list catches the Android back button, closing itself
	// instead of popping the screen behind it. The `sheet` presentation gets the
	// same behaviour from its BottomSheet; the native picker owns its own back.
	useBackHandler(open && presentation === "overlay", close);

	const toggle = useCallback(() => {
		if (open) {
			close();
			return;
		}

		const show = () => {
			chevron.value = withTiming(1, { duration: 160 });
			setOpen(true);
			onOpenChange?.(true);
		};

		if (presentation !== "overlay") {
			show();
			return;
		}

		// The floating list is positioned in window coordinates, so it has to know
		// where the trigger actually landed — not where layout said it would.
		triggerRef.current?.measureInWindow((x, y, width, height) => {
			setAnchor({ x, y, width, height });
			show();
		});
	}, [chevron, close, onOpenChange, open, presentation]);

	const context = useMemo<SelectContextValue>(
		() => ({
			value,
			onSelect: (next) => {
				onValueChange(next);
				close();
			},
			query,
			setQuery,
		}),
		[value, onValueChange, close, query],
	);

	const slots = selectVariants({ disabled: !!disabled, presentation });
	const chevronColor = useCSSVariable("--color-muted-foreground");

	const chevronStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${chevron.value * 180}deg` }],
	}));

	const trigger = (
		<Pressable
			ref={triggerRef}
			/*
			 * A trigger that owns a list of options and reports whether that list is
			 * open is a combobox, not a button — and `expanded` only means anything
			 * on a role that can be expanded. Announced as "collapsed"/"expanded"
			 * rather than as a button whose state has nowhere to be read.
			 */
			accessibilityRole="combobox"
			accessibilityState={{ disabled: !!disabled, expanded: open }}
			disabled={disabled}
			onPress={toggle}
			className={slots.trigger({ className: triggerClassName })}
		>
			{selectedLabel ? (
				<Text className={slots.triggerLabel({ className: valueClassName })}>{selectedLabel}</Text>
			) : (
				<Text className={slots.placeholder({ className: placeholderClassName })}>{placeholder}</Text>
			)}
			<Animated.View style={chevronStyle}>
				<ChevronDownIcon color={typeof chevronColor === "string" ? chevronColor : "#737373"} />
			</Animated.View>
		</Pressable>
	);

	/*
	 * The filter, and the list it narrows. Both are built once here rather than
	 * per presentation: the three surfaces differ in where they put the field —
	 * above the scroller, so it does not scroll away with the options — not in
	 * what it is.
	 */
	const search = searchable ? (
		<View className={slots.search({ className: searchClassName })}>
			<InputGroup>
				<InputGroup.Prefix isDecorative>
					<SearchIcon size={18} color={typeof chevronColor === "string" ? chevronColor : "#737373"} />
				</InputGroup.Prefix>
				<InputGroup.Input
					variant="filled"
					size="sm"
					className={searchInputClassName}
					containerClassName={searchContainerClassName}
					value={query}
					onChangeText={setQuery}
					placeholder={searchPlaceholder}
					accessibilityLabel={searchPlaceholder}
					autoCapitalize="none"
					autoCorrect={false}
					returnKeyType="search"
					clearButtonMode="while-editing"
				/>
			</InputGroup>
		</View>
	) : null;

	const optionList = noMatches ? (
		<Text className={slots.empty({ className: emptyClassName })}>{emptyMessage}</Text>
	) : filtered === null ? (
		textChildren(children)
	) : (
		filtered.kept
	);

	if (presentation === "sheet") {
		return (
			<SelectContext.Provider value={context}>
				<View className={className}>{trigger}</View>
				{/* The sheet only ever reports a close — it is opened from the
            trigger — and close() has the chevron to put back. */}
				<BottomSheet
					open={open}
					onOpenChange={(next) => {
						if (!next) close();
					}}
				>
					<BottomSheet.Content>
						{/* BottomSheet.Content portals its children out of this subtree —
                re-provide the select context so Select.Item keeps working. */}
						<SelectContext.Provider value={context}>
							{title ? (
								<Text size="lg" weight="semibold" className="mb-2 px-3">
									{title}
								</Text>
							) : null}
							{search ? <View className="px-1">{search}</View> : null}
							<ScrollView
								bounces={false}
								className="max-h-96"
								// The filter is a text field above a scroller: dismissing the
								// keyboard on a drag is what lets you look at what you filtered
								// to without first tapping somewhere neutral.
								keyboardDismissMode="on-drag"
								keyboardShouldPersistTaps="handled"
							>
								<View className={slots.options({ className: listClassName })}>{optionList}</View>
							</ScrollView>
						</SelectContext.Provider>
					</BottomSheet.Content>
				</BottomSheet>
			</SelectContext.Provider>
		);
	}

	if (presentation === "inline") {
		return (
			<SelectContext.Provider value={context}>
				<View className={className}>
					{trigger}
					{open ? (
						<Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(120)} className={slots.list({ className: listClassName })}>
							{search}
							{optionList}
						</Animated.View>
					) : null}
				</View>
			</SelectContext.Provider>
		);
	}

	// Flip above the trigger when the list would run off the bottom. listHeight
	// is 0 on the first frame, so the list opens downwards and corrects itself
	// once measured — which is invisible inside the 140ms fade.
	const spaceBelow = anchor ? screenHeight - (anchor.y + anchor.height) - offset : 0;
	const flip = !!anchor && listHeight > 0 && listHeight > spaceBelow;

	const overlayPosition = anchor
		? {
				position: "absolute" as const,
				left: anchor.x,
				...(flip ? { bottom: screenHeight - anchor.y + offset } : { top: anchor.y + anchor.height + offset }),
				...(contentWidth === "trigger" ? { width: anchor.width } : typeof contentWidth === "number" ? { width: contentWidth } : { minWidth: anchor.width }),
				// Never collapse to nothing in a cramped viewport — the list scrolls.
				maxHeight: Math.max((flip ? anchor.y : spaceBelow) - offset, 160),
			}
		: null;

	const onListLayout = (event: LayoutChangeEvent) => {
		setListHeight(event.nativeEvent.layout.height);
	};

	return (
		<SelectContext.Provider value={context}>
			<View className={className}>{trigger}</View>

			{open && overlayPosition ? (
				<Portal>
					{/*
					 * Full-screen catcher so a press anywhere else dismisses the list.
					 *
					 * Hidden from assistive tech, and deliberately: it is a dismiss
					 * affordance for a pointer, and announcing it would put an unlabelled
					 * full-screen "button" ahead of the options in the reading order,
					 * where swiping through the list would land on it before the first
					 * one. Escaping the list is the back gesture's job, and on iOS the
					 * modal flag's.
					 */}
					<Pressable
						accessible={false}
						importantForAccessibility="no-hide-descendants"
						accessibilityElementsHidden
						onPress={close}
						style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
					/>
					<SelectContext.Provider value={context}>
						<Animated.View
							entering={FadeIn.duration(140)}
							exiting={FadeOut.duration(120)}
							onLayout={onListLayout}
							style={overlayPosition}
							/*
							 * The floating list is a modal layer, the same as the sheet
							 * presentation's is — it covers the screen with a catcher and
							 * takes the back button. Without this the page behind it stays
							 * in the accessibility tree, so a screen reader could walk out
							 * of the open list into content the list is covering and act on
							 * it. The sheet gets this from BottomSheet; the anchored list
							 * has to say it itself.
							 */
							accessibilityViewIsModal
							className={slots.list({ className: listClassName })}
						>
							{search}
							<ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
								{optionList}
							</ScrollView>
						</Animated.View>
					</SelectContext.Provider>
				</Portal>
			) : null}
		</SelectContext.Provider>
	);
}

export const Select = Object.assign(SelectRoot, {
	Item: SelectItem,
	Group: SelectGroup,
});
