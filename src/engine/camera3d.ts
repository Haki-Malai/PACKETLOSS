import { OrthographicCamera, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { Camera2D, CameraFollowTarget } from './camera';
import { clamp } from './math';

const TILT = (20 * Math.PI) / 180;
const GROUND_VERTICAL_SCALE = Math.cos(TILT);
const SIDE_LEAN = (5 * Math.PI) / 180;
const SIDE_LEAN_SIN = Math.sin(SIDE_LEAN);
const SIDE_LEAN_COS = Math.cos(SIDE_LEAN);

export class Camera3D {
  readonly camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 4000);

  private readonly tracker = new Camera2D();
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly ground = new Plane(new Vector3(0, 1, 0), 0);
  private readonly intersection = new Vector3();
  private viewportWidth = 1;
  private viewportHeight = 1;
  private worldWidth = 1;
  private worldHeight = 1;
  private distance = 1000;

  setBounds(width: number, height: number): void {
    this.worldWidth = Math.max(1, width);
    this.worldHeight = Math.max(1, height);
    this.tracker.setBounds(width, height);
    this.distance = Math.max(1000, Math.hypot(width, height) * 2);
    this.camera.far = this.distance * 4;
    this.updateProjection();
  }

  setZoom(zoom: number): void {
    this.tracker.setZoom(zoom);
    this.updateProjection();
  }

  getZoom(): number {
    return this.tracker.getZoom();
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
    // The tilted view spans more ground vertically than its camera-plane frustum.
    this.tracker.setViewport(this.viewportWidth, this.viewportHeight / GROUND_VERTICAL_SCALE);
    this.updateProjection();
  }

  startFollow(target: CameraFollowTarget, lerpX: number, lerpY: number): void {
    this.tracker.startFollow(target, lerpX, lerpY);
  }

  snapToFollowTarget(): void {
    this.tracker.snapToFollowTarget();
  }

  update(): void {
    this.tracker.update();
  }

  /** Rebases the rolling maze's vertical camera coordinates. */
  translateY(pixels: number): void {
    this.tracker.translateY(pixels);
  }

  /** Returns the projected ground rectangle currently covered by the game camera. */
  getVisibleGroundBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    const position = this.tracker.getRenderPosition();
    return {
      minX: position.x,
      maxX: position.x + this.viewportWidth / this.tracker.getZoom(),
      minY: position.y,
      maxY: position.y + this.viewportHeight / this.tracker.getZoom() / GROUND_VERTICAL_SCALE,
    };
  }

  getRenderPosition(alpha = 1): { x: number; y: number } {
    return this.tracker.getRenderPosition(alpha);
  }

  present(alpha = 1, pixelRatio = 1): void {
    const position = this.tracker.getRenderPosition(alpha);
    const zoom = this.tracker.getZoom();
    const groundWidth = this.viewportWidth / zoom;
    const groundHeight = this.viewportHeight / zoom / GROUND_VERTICAL_SCALE;
    // Match the renderer's integer drawing-buffer dimensions, including fractional DPR.
    const pixelsPerX = Math.max(1, Math.floor(this.viewportWidth * pixelRatio)) / groundWidth;
    const pixelsPerZ = Math.max(1, Math.floor(this.viewportHeight * pixelRatio)) / groundHeight;
    const focusX = this.alignToPixel(position.x, pixelsPerX, this.worldWidth, groundWidth) + groundWidth / 2;
    const focusZ = this.alignToPixel(position.y, pixelsPerZ, this.worldHeight, groundHeight) + groundHeight / 2;

    this.camera.up.set(0, 0, -1);
    this.camera.position.set(
      focusX + this.distance * GROUND_VERTICAL_SCALE * SIDE_LEAN_SIN,
      this.distance * GROUND_VERTICAL_SCALE * SIDE_LEAN_COS,
      focusZ + this.distance * Math.sin(TILT),
    );
    this.camera.lookAt(focusX, 0, focusZ);
    this.camera.updateMatrixWorld();
  }

  private alignToPixel(value: number, pixelsPerUnit: number, worldSize: number, visibleSize: number): number {
    const min = visibleSize >= worldSize ? (worldSize - visibleSize) / 2 : 0;
    const max = Math.max(min, worldSize - visibleSize);
    // Preserve exact boundary stops and small-world centering.
    if (value <= min || value >= max) return clamp(value, min, max);
    return clamp(Math.round(value * pixelsPerUnit) / pixelsPerUnit, min, max);
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    this.pointer.set((screenX / this.viewportWidth) * 2 - 1, 1 - (screenY / this.viewportHeight) * 2);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.raycaster.ray.intersectPlane(this.ground, this.intersection);
    return { x: this.intersection.x, y: this.intersection.z };
  }

  private updateProjection(): void {
    const halfWidth = this.viewportWidth / this.tracker.getZoom() / 2;
    const halfHeight = this.viewportHeight / this.tracker.getZoom() / 2;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
    // Correct the side lean so ground X/Z retain their original scale and screen axes.
    // Height still projects diagonally, revealing wall sides without slanting the maze.
    const projection = this.camera.projectionMatrix.elements;
    projection[0] /= SIDE_LEAN_COS;
    projection[1] = -Math.sin(TILT) * Math.tan(SIDE_LEAN) * projection[5];
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
  }
}
