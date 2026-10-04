import {
  Camera, CanvasTexture, Group, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry,
  Quaternion, SRGBColorSpace,
} from 'three';

interface Label {
  context: CanvasRenderingContext2D;
  texture: CanvasTexture;
  mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;
  color: string;
  text: string | undefined;
}

/** Camera-facing identity labels with reusable canvases, owned separately from the animated Packet. */
export class PacketLabels {
  readonly group = new Group();
  private readonly geometry: PlaneGeometry;
  private readonly labels: Label[];
  private readonly parentRotation = new Quaternion();
  private readonly cameraRotation = new Quaternion();
  private disposed = false;

  /** Places two owned labels close above/below the Packet center; accepts a DOM-independent canvas factory. */
  constructor(color: string, createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas')) {
    const contexts = [0, 1].map(() => {
      const canvas = createCanvas();
      canvas.width = 512;
      canvas.height = 96;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to create Packet label canvas.');
      return context;
    });
    this.geometry = new PlaneGeometry(24, 4.5);
    this.group.name = 'packet-labels';
    this.group.position.y = 6.15;
    this.group.visible = false;
    this.labels = contexts.map((context, index) => {
      const texture = new CanvasTexture(context.canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      const material = new MeshBasicMaterial({
        map: texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
      });
      const mesh = new Mesh(this.geometry, material);
      mesh.name = index === 0 ? 'packet-name-label' : 'packet-score-label';
      mesh.position.y = index === 0 ? 5 : -4.5;
      mesh.renderOrder = 100;
      this.group.add(mesh);
      return { context, texture, mesh, color: index === 0 ? '#ffffff' : color, text: undefined };
    });
  }

  /** Updates only changed text, preserving the player's original name and displaying an ungrouped score. */
  setIdentity(name: string, score: number): void {
    if (this.disposed) return;
    this.draw(this.labels[0], name);
    this.draw(this.labels[1], String(Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0));
    this.group.visible = true;
  }

  /** Cancels parent rotation so label planes stay upright in the current camera's view. */
  faceCamera(camera: Camera): void {
    if (this.disposed) return;
    this.parentRotation.identity();
    this.group.parent?.getWorldQuaternion(this.parentRotation);
    camera.getWorldQuaternion(this.cameraRotation);
    this.group.quaternion.copy(this.parentRotation.invert()).multiply(this.cameraRotation);
  }

  /** Releases every owned GPU resource once without touching other children of the Packet. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.geometry.dispose();
    for (const label of this.labels) {
      label.texture.dispose();
      label.mesh.material.dispose();
    }
    this.group.clear();
    this.group.removeFromParent();
  }

  /** Redraws a compact dark plate and its text into the existing texture only when the text changes. */
  private draw(label: Label, text: string): void {
    if (label.text === text) return;
    label.text = text;
    const context = label.context;
    const width = context.canvas.width;
    const height = context.canvas.height;
    context.clearRect(0, 0, width, height);
    context.font = '600 48px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const plateWidth = Math.min(width, context.measureText(text).width + 32);
    context.fillStyle = 'rgba(2, 8, 18, 0.88)';
    context.fillRect((width - plateWidth) / 2, 8, plateWidth, height - 16);
    context.fillStyle = label.color;
    context.fillText(text, width / 2, height / 2, width - 32);
    label.texture.needsUpdate = true;
  }
}
