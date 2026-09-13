type SelectorMatcher = (_element: FakeElement) => boolean;

function toTokens(value: string): string[] {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function createSelectorMatcher(selector: string): SelectorMatcher {
  const trimmed = selector.trim();

  if (trimmed.includes(',')) {
    const matchers = trimmed.split(',').map(createSelectorMatcher);
    return (element) => matchers.some((matcher) => matcher(element));
  }

  if (trimmed.startsWith('#')) return (element) => element.id === trimmed.slice(1);

  if (trimmed.includes('.') && !trimmed.startsWith('[')) {
    const [tag, className] = trimmed.split('.');
    return (element) => (!tag || element.tagName === tag) && element.classList.contains(className);
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    const equalsIndex = inner.indexOf('=');

    if (equalsIndex === -1) {
      const attributeName = inner;
      return (element) => element.getAttribute(attributeName) !== null;
    }

    const attributeName = inner.slice(0, equalsIndex).trim();
    const rawValue = inner.slice(equalsIndex + 1).trim();
    const attributeValue = rawValue.replace(/^['"]|['"]$/g, '');
    return (element) => element.getAttribute(attributeName) === attributeValue;
  }

  const tagName = trimmed.toLowerCase();
  return (element) => element.tagName === tagName;
}

function collectMatches(root: FakeElement, matcher: SelectorMatcher, matches: FakeElement[]): void {
  for (const child of root.children) {
    if (matcher(child)) {
      matches.push(child);
    }
    collectMatches(child, matcher, matches);
  }
}

function findById(root: FakeElement, id: string): FakeElement | null {
  const rootId = (root as unknown as { id?: string }).id;
  if (rootId === id) {
    return root;
  }

  for (const child of root.children) {
    const match = findById(child, id);
    if (match) {
      return match;
    }
  }

  return null;
}

export class FakeClassList {
  constructor(private readonly owner: FakeElement) {}

  add(...tokens: string[]): void {
    tokens.forEach((token) => this.owner.addClassToken(token));
  }

  remove(...tokens: string[]): void {
    tokens.forEach((token) => this.owner.removeClassToken(token));
  }

  contains(token: string): boolean {
    return this.owner.hasClassToken(token);
  }

  toggle(token: string, force?: boolean): boolean {
    const shouldAdd = force ?? !this.contains(token);
    if (shouldAdd) {
      this.add(token);
    } else {
      this.remove(token);
    }
    return shouldAdd;
  }
}

export class FakeElement extends EventTarget {
  private readonly classTokens = new Set<string>();
  private readonly attributes = new Map<string, string>();

  readonly children: FakeElement[] = [];
  readonly classList: FakeClassList;
  readonly style: Record<string, string> = {};
  parentElement: FakeElement | null = null;
  textContent = '';
  src = '';
  alt = '';
  id = '';
  value = '';
  hidden = false;
  disabled = false;
  inert = false;
  tabIndex = 0;
  scrollTop = 0;

  constructor(readonly tagName: string, public ownerDocument?: FakeDocument) {
    super();
    this.classList = new FakeClassList(this);
  }

  get className(): string {
    return [...this.classTokens].join(' ');
  }

  set className(value: string) {
    this.classTokens.clear();
    toTokens(value).forEach((token) => this.classTokens.add(token));
  }

  append(...nodes: Array<FakeElement | string>): void {
    nodes.forEach((node) => {
      if (typeof node === 'string') {
        this.textContent += node;
        return;
      }
      this.appendChild(node);
    });
  }

  appendChild(node: FakeElement): FakeElement {
    node.parentElement?.removeChild(node);
    node.parentElement = this;
    node.ownerDocument = this.ownerDocument;
    this.children.push(node);
    return node;
  }

  replaceChildren(...nodes: FakeElement[]): void {
    this.children.forEach((child) => {
      child.parentElement = null;
    });
    this.children.length = 0;
    nodes.forEach((node) => {
      this.appendChild(node);
    });
  }

  remove(): void {
    this.parentElement?.removeChild(this);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
    if (name === 'id') this.id = value;
    if (name === 'disabled') this.disabled = true;
  }

  getAttribute(name: string): string | null {
    if (name === 'id') return this.id || null;
    if (name === 'disabled' && this.disabled) return '';
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.getAttribute(name) !== null;
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
    if (name === 'id') this.id = '';
    if (name === 'disabled') this.disabled = false;
  }

  focus(_options?: FocusOptions): void {
    if (this.ownerDocument) this.ownerDocument.activeElement = this;
  }

  click(): void {
    if (!this.disabled) this.dispatchEvent(new Event('click', { cancelable: true }));
  }

  contains(element: FakeElement | null): boolean {
    return element === this || this.children.some((child) => child.contains(element));
  }

  closest(selector: string): FakeElement | null {
    const matcher = createSelectorMatcher(selector);
    return matcher(this) ? this : this.parentElement?.closest(selector) ?? null;
  }

  querySelector(selector: string): FakeElement | null {
    const matcher = createSelectorMatcher(selector);
    const matches: FakeElement[] = [];
    collectMatches(this, matcher, matches);
    return matches[0] ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const matcher = createSelectorMatcher(selector);
    const matches: FakeElement[] = [];
    collectMatches(this, matcher, matches);
    return matches;
  }

  addClassToken(token: string): void {
    if (token) {
      this.classTokens.add(token);
    }
  }

  removeClassToken(token: string): void {
    this.classTokens.delete(token);
  }

  hasClassToken(token: string): boolean {
    return this.classTokens.has(token);
  }

  private removeChild(node: FakeElement): void {
    const index = this.children.indexOf(node);
    if (index === -1) {
      return;
    }
    this.children.splice(index, 1);
    node.parentElement = null;
  }
}

export class FakeDocument extends EventTarget {
  readonly body = new FakeElement('body', this);
  activeElement: FakeElement | null = this.body;

  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName.toLowerCase(), this);
  }

  querySelector(selector: string): FakeElement | null {
    return this.body.querySelector(selector);
  }

  getElementById(id: string): FakeElement | null {
    return findById(this.body, id);
  }
}
