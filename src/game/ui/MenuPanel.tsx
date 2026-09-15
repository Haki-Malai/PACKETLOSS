import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent as ReactFocusEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
    type Ref,
} from 'react';

export const MenuInteraction = createContext<() => void>(() => {});
const MenuSelection = createContext<string | null | undefined>(undefined);

export function MenuButton({
    action,
    variant = '',
    layout = 'full',
    className = '',
    onClick,
    ...props
}: ComponentProps<'button'> & {
    action?: string;
    layout?: 'full' | 'compact' | 'icon';
    variant?: '' | 'primary' | 'danger';
}) {
    const claimPause = useContext(MenuInteraction);
    const selectedButtonId = useContext(MenuSelection);
    const selectionId = useId();
    const isSelected =
        selectedButtonId === undefined || selectedButtonId === null
            ? variant === 'primary'
            : selectedButtonId === selectionId;
    return (
        <button
            {...props}
            type={props.type ?? 'button'}
            data-action={action}
            data-menu-button={selectedButtonId === undefined ? undefined : selectionId}
            data-menu-default={variant === 'primary' || undefined}
            className={`packet-button ${buttonLayout} ${layout === 'icon' ? 'size-12 min-h-12 min-w-12 shrink-0 p-0' : layout === 'compact' ? 'min-h-11 w-auto px-3 py-2' : 'min-h-12 w-full px-4 py-3'} ${isSelected ? 'packet-primary' : variant === 'danger' ? 'packet-danger' : ''} ${className}`}
            onClick={(event) => {
                claimPause();
                onClick?.(event);
            }}
        />
    );
}

export const buttonLayout =
    'inline-flex items-center justify-center rounded-none border text-center font-heading text-xs leading-normal font-semibold tracking-[0.035em] touch-manipulation';
export const fieldLayout = 'flex min-w-0 flex-col gap-2 text-[0.85rem] text-packet-muted';
export const inputLayout =
    'min-h-12 w-full rounded-none border border-packet-line bg-packet-raised px-3 py-2.5 text-packet-text';

const interactiveMenuControlSelector =
    'button, a, input, select, textarea, [role="button"], [role="combobox"], [role="option"]';
const navigableMenuButtonSelector = 'button.packet-button[data-menu-button]:not(:disabled)';

/** Returns enabled, visible menu buttons in their document order. */
function getNavigableMenuButtons(panel: HTMLDivElement): HTMLButtonElement[] {
    return Array.from(
        panel.querySelectorAll<HTMLButtonElement>(navigableMenuButtonSelector)
    ).filter((button) => !button.closest('[hidden],[inert]'));
}

export type SelectOption<Value extends string> = {
    value: Value;
    label: string;
};

export function CustomSelect<Value extends string>({
    ariaLabel,
    value,
    options,
    onChange,
    className = '',
    control,
    disabled = false,
    placement = 'bottom',
}: {
    ariaLabel: string;
    value: Value;
    options: readonly SelectOption<Value>[];
    onChange: (_value: Value) => void;
    className?: string;
    control?: string;
    disabled?: boolean;
    placement?: 'top' | 'bottom';
}) {
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const listboxId = useId();
    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value)
    );
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(selectedIndex);
    const isOpen = open && !disabled;

    useEffect(() => {
        if (!isOpen) return;

        /** Closes the list when a pointer interaction starts outside the control. */
        function closeOnOutsidePointer(event: PointerEvent) {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        }

        document.addEventListener('pointerdown', closeOnOutsidePointer, true);
        return () => document.removeEventListener('pointerdown', closeOnOutsidePointer, true);
    }, [isOpen]);

    /** Opens the list with its current selection highlighted. */
    function openList() {
        setActiveIndex(selectedIndex);
        setOpen(true);
    }

    /** Moves the active option through the list without committing a new value. */
    function moveActive(offset: number) {
        setActiveIndex((index) => (index + offset + options.length) % options.length);
    }

    /** Commits an option, closes the list, and returns focus to the trigger. */
    function choose(index: number) {
        const option = options[index];
        if (option.value !== value) onChange(option.value);
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
    }

    /** Implements select-like keyboard interaction while focus remains on the combobox. */
    function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
        if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            setOpen(false);
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (isOpen) choose(activeIndex);
            else openList();
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (isOpen) moveActive(event.key === 'ArrowDown' ? 1 : -1);
            else openList();
            return;
        }
        if (isOpen && (event.key === 'Home' || event.key === 'End')) {
            event.preventDefault();
            setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
        }
    }

    return (
        <div
            ref={root}
            className={`packet-select ${className}`}
            data-open={isOpen || undefined}
            data-placement={placement}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
        >
            <button
                ref={trigger}
                type="button"
                className="packet-select-trigger"
                role="combobox"
                aria-label={ariaLabel}
                aria-controls={listboxId}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-activedescendant={isOpen ? `${listboxId}-option-${activeIndex}` : undefined}
                data-control={control}
                disabled={disabled}
                onClick={() => {
                    if (isOpen) setOpen(false);
                    else openList();
                }}
                onKeyDown={handleKeyDown}
            >
                <span className="packet-select-value">
                    {options[selectedIndex]?.label ?? value}
                </span>
                <span className="packet-select-chevron" aria-hidden="true" />
            </button>
            {isOpen && (
                <ul className="packet-select-list" id={listboxId} role="listbox">
                    {options.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${listboxId}-option-${index}`}
                            className="packet-select-option"
                            role="option"
                            aria-selected={option.value === value}
                            data-active={index === activeIndex || undefined}
                            data-value={option.value}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => choose(index)}
                        >
                            <span className="packet-select-marker" aria-hidden="true" />
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function MenuColumns({ children }: { children: ReactNode }) {
    return (
        <div className="my-4 mb-2 grid min-w-0 gap-7 min-[800px]:grid-cols-2 min-[800px]:gap-8 [&>section]:min-w-0 min-[800px]:[&>section+section]:border-l min-[800px]:[&>section+section]:border-packet-line min-[800px]:[&>section+section]:pl-8">
            {children}
        </div>
    );
}

/** Shared frame and content slots for every application menu. */
export function MenuPanel({
    eyebrow,
    title,
    heading,
    wide,
    centered,
    onBack,
    children,
    actions,
    footer,
    panelRef,
    outcome,
    tutorialPhase,
}: {
    eyebrow: string;
    title: string;
    heading?: (_id: string) => ReactNode;
    wide?: boolean;
    centered?: boolean;
    onBack?: () => void;
    children?: ReactNode;
    actions?: ReactNode;
    footer?: ReactNode;
    panelRef?: Ref<HTMLDivElement>;
    outcome?: string;
    tutorialPhase?: string;
}) {
    const headingId = useId();
    const ownPanelRef = useRef<HTMLDivElement>(null);
    const [selectedButtonId, setSelectedButtonId] = useState<string | null>(null);

    /** Keeps the shell's panel ref and this component's local navigation ref synchronized. */
    const capturePanel = useCallback(
        (node: HTMLDivElement | null) => {
            ownPanelRef.current = node;
            if (typeof panelRef === 'function') panelRef(node);
            else if (panelRef) panelRef.current = node;
        },
        [panelRef]
    );

    useLayoutEffect(() => {
        const buttons = ownPanelRef.current ? getNavigableMenuButtons(ownPanelRef.current) : [];
        const initial =
            buttons.find((button) => button.dataset.menuDefault === 'true') ?? buttons[0];
        setSelectedButtonId(initial?.dataset.menuButton ?? null);
    }, [outcome, title, tutorialPhase]);

    /** Makes keyboard or programmatic button focus the current menu selection. */
    function selectFocusedButton(event: ReactFocusEvent<HTMLDivElement>): void {
        const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
            navigableMenuButtonSelector
        );
        if (button) setSelectedButtonId(button.dataset.menuButton ?? null);
    }

    /** Moves menu selection with arrows and activates it with Enter from the panel. */
    function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
        if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
        ) {
            return;
        }

        const target = event.target as HTMLElement | null;
        const targetButton = target?.closest<HTMLButtonElement>(navigableMenuButtonSelector);
        const interactiveControl = target?.closest(interactiveMenuControlSelector);
        const direction =
            event.key === 'ArrowUp' || event.key === 'ArrowLeft'
                ? -1
                : event.key === 'ArrowDown' || event.key === 'ArrowRight'
                  ? 1
                  : 0;

        if (direction !== 0) {
            if (interactiveControl && !targetButton) return;
            const buttons = getNavigableMenuButtons(event.currentTarget);
            if (buttons.length === 0) return;
            const selectedIndex = buttons.findIndex(
                (button) => button.dataset.menuButton === selectedButtonId
            );
            const nextIndex =
                selectedIndex < 0
                    ? direction > 0
                        ? 0
                        : buttons.length - 1
                    : (selectedIndex + direction + buttons.length) % buttons.length;
            const nextButton = buttons[nextIndex];
            event.preventDefault();
            setSelectedButtonId(nextButton.dataset.menuButton ?? null);
            nextButton.focus();
            return;
        }

        if (event.key !== 'Enter' || event.repeat || interactiveControl) return;
        const buttons = getNavigableMenuButtons(event.currentTarget);
        const selected =
            buttons.find((button) => button.dataset.menuButton === selectedButtonId) ??
            buttons.find((button) => button.dataset.menuDefault === 'true') ??
            buttons[0];
        if (!selected) return;
        event.preventDefault();
        selected.click();
    }

    return (
        <MenuSelection.Provider value={selectedButtonId}>
            <div
                ref={capturePanel}
                className={`packet-panel relative z-1 flex w-full shrink-0 flex-col border border-packet-line bg-packet-surface outline-none ${tutorialPhase ? 'mt-auto mr-0 mb-0 ml-0 max-w-[480px] gap-4 p-[clamp(18px,3vw,26px)]' : `m-auto gap-6 p-[clamp(22px,5vw,40px)] ${wide ? 'max-w-[1040px]' : 'max-w-[640px]'}`} ${centered ? 'packet-title-panel' : ''}`}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                data-outcome={outcome}
                data-tutorial-phase={tutorialPhase}
                onFocusCapture={selectFocusedButton}
                onKeyDown={handleMenuKeyDown}
            >
                <div className="packet-panel-signal" aria-hidden="true" />
                <header className="flex items-start gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <p className="packet-eyebrow">{eyebrow}</p>
                        {heading ? (
                            heading(headingId)
                        ) : (
                            <h1 id={headingId} className="packet-heading">
                                {title}
                            </h1>
                        )}
                    </div>
                    {onBack && (
                        <MenuButton
                            action="back"
                            onClick={onBack}
                            layout="icon"
                            aria-label="Back"
                            title="Back (Escape)"
                        >
                            <span
                                aria-hidden="true"
                                className="font-sans text-[1.6rem] leading-none"
                            >
                                ←
                            </span>
                        </MenuButton>
                    )}
                </header>
                <div className="flex min-w-0 flex-col gap-3 empty:hidden">{children}</div>
                <div className="grid gap-3 empty:hidden">{actions}</div>
                <footer className="flex min-w-0 flex-col gap-3 empty:hidden [&>.packet-note]:m-0">
                    {footer}
                </footer>
            </div>
        </MenuSelection.Provider>
    );
}
