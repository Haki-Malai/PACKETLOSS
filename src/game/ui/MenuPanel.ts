export function element<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className = '',
    text = ''
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
}

export function menuButton(
    label: string,
    action: string,
    onClick: () => void,
    variant = ''
): HTMLButtonElement {
    const button = element('button', `packet-button ${variant}`.trim(), label);
    button.type = 'button';
    button.setAttribute('data-action', action);
    button.addEventListener('click', onClick);
    return button;
}

export interface MenuPanel {
    root: HTMLDivElement;
    header: HTMLElement;
    heading: HTMLHeadingElement;
    body: HTMLDivElement;
    actions: HTMLDivElement;
    footer: HTMLElement;
}

/** Shared frame and content slots for every application menu. */
export function createMenuPanel(options: {
    eyebrow: string;
    title: string;
    wide?: boolean;
    centered?: boolean;
    onBack?: () => void;
}): MenuPanel {
    const root = element('div', 'packet-panel');
    if (options.wide) root.classList.add('packet-panel-wide');
    if (options.centered) root.classList.add('packet-title-panel');
    root.tabIndex = -1;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'packet-menu-heading');

    const signal = element('div', 'packet-panel-signal');
    signal.setAttribute('aria-hidden', 'true');
    const header = element('header', 'packet-panel-header');
    const titles = element('div', 'packet-panel-titles');
    const heading = element('h1', 'packet-heading', options.title);
    heading.id = 'packet-menu-heading';
    titles.append(element('p', 'packet-eyebrow', options.eyebrow), heading);
    header.append(titles);
    if (options.onBack) {
        const back = menuButton('', 'back', options.onBack, 'packet-icon-button');
        back.setAttribute('aria-label', 'Back');
        back.setAttribute('title', 'Back (Escape)');
        const icon = element('span', 'packet-back-icon', '←');
        icon.setAttribute('aria-hidden', 'true');
        back.append(icon);
        header.append(back);
    }
    const body = element('div', 'packet-panel-body');
    const actions = element('div', 'packet-panel-actions');
    const footer = element('footer', 'packet-panel-footer');
    root.append(signal, header, body, actions, footer);
    return { root, header, heading, body, actions, footer };
}
