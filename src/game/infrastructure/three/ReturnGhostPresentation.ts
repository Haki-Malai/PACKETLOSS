import { BoxGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

/** A defeated enemy's small, wide-eyed bug; all motion uses the presentation clock. */
export class ReturnGhostPresentation {
  readonly group = new Group();
  private readonly feet: Mesh[] = [];
  private readonly pupils: Mesh[] = [];

  constructor(color: number) {
    this.group.name = 'return-bug';
    this.group.visible = false;
    const sphere = new SphereGeometry(1, 12, 8);
    const cube = new BoxGeometry(1, 1, 1);
    const shell = new MeshBasicMaterial({ color: 0x14202a, toneMapped: false });
    const white = new MeshBasicMaterial({ color: 0xedffff, toneMapped: false });
    const pupil = new MeshBasicMaterial({ color: 0x02060b, toneMapped: false });
    const identity = new MeshBasicMaterial({ color, toneMapped: false });
    const body = new Mesh(sphere, shell);
    body.name = 'return-bug-body';
    body.position.y = 0.8;
    body.scale.set(1, 0.65, 0.85);
    this.group.add(body);
    for (const [index, side] of [-1, 1].entries()) {
      const eye = new Mesh(sphere, white);
      eye.name = `return-eye-${index}`;
      eye.position.set(side * 0.63, 1.25, 0.1);
      eye.scale.set(0.7, 0.55, 0.77);
      const dot = new Mesh(sphere, pupil);
      dot.name = `return-pupil-${index}`;
      dot.position.set(side * 0.63, 1.73, 0.35);
      dot.scale.set(0.26, 0.15, 0.3);
      this.pupils.push(dot);
      this.group.add(eye, dot);
      for (let row = 0; row < 3; row += 1) {
        const foot = new Mesh(cube, shell);
        foot.name = `return-foot-${index}-${row}`;
        foot.position.set(side * 1.03, 0.2, (row - 1) * 0.6);
        foot.scale.set(0.65, 0.16, 0.23);
        this.feet.push(foot);
        this.group.add(foot);
      }
    }
    const nub = new Mesh(sphere, identity);
    nub.name = 'return-identity-nub';
    nub.position.set(0, 1.27, -0.68);
    nub.scale.setScalar(0.32);
    this.group.add(nub);
  }

  sample(timeSeconds: number, progress: number | null): void {
    this.group.visible = progress !== null && progress > 0.55;
    const reveal = progress === null ? 0 : MathUtils.smootherstep(progress, 0.55, 1);
    this.group.scale.setScalar(reveal);
    this.group.position.y = Math.abs(Math.sin(timeSeconds * 19)) * 0.13;
    for (const [index, foot] of this.feet.entries()) {
      const step = Math.sin(timeSeconds * 28 + index * Math.PI);
      foot.rotation.y = step * 0.4;
      foot.position.y = 0.2 + Math.max(0, step) * 0.2;
    }
    for (const [index, pupil] of this.pupils.entries()) {
      pupil.position.x = (index === 0 ? -0.63 : 0.63) + Math.sin(timeSeconds * 9 + index * 2) * 0.12;
    }
  }
}
