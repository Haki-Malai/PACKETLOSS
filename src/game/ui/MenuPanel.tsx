import {
    createContext,
    useContext,
    useId,
    type ComponentProps,
    type ReactNode,
    type Ref,
} from 'react';

export const MenuInteraction = createContext<() => void>(() => {});

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
    return (
        <button
            {...props}
            type={props.type ?? 'button'}
            data-action={action}
            className={`packet-button ${buttonLayout} ${layout === 'icon' ? 'size-12 min-h-12 min-w-12 shrink-0 p-0' : layout === 'compact' ? 'min-h-11 w-auto px-3 py-2' : 'min-h-12 w-full px-4 py-3'} ${variant === 'primary' ? 'packet-primary' : variant === 'danger' ? 'packet-danger' : ''} ${className}`}
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
    return (
        <div
            ref={panelRef}
            className={`packet-panel relative z-1 flex w-full shrink-0 flex-col border border-packet-line bg-packet-surface outline-none ${tutorialPhase ? 'mt-auto mr-0 mb-0 ml-0 max-w-[480px] gap-4 p-[clamp(18px,3vw,26px)]' : `m-auto gap-6 p-[clamp(22px,5vw,40px)] ${wide ? 'max-w-[1040px]' : 'max-w-[640px]'}`} ${centered ? 'packet-title-panel' : ''}`}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            data-outcome={outcome}
            data-tutorial-phase={tutorialPhase}
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
                        <span aria-hidden="true" className="font-sans text-[1.6rem] leading-none">
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
    );
}
