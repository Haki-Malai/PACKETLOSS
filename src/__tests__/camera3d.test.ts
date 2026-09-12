import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { Camera3D } from '../engine/camera3d';

const VERTICAL_SCALE = Math.cos((20 * Math.PI) / 180);

function createCamera(target = { x: 400, y: 300 }): Camera3D {
  const camera = new Camera3D();
  camera.setBounds(1000, 800);
  camera.setZoom(5);
  camera.setViewport(800, 600);
  camera.startFollow(target, 0.09, 0.09);
  camera.snapToFollowTarget();
  camera.present();
  return camera;
}

function project(camera: Camera3D, x: number, z: number, width = 800, height = 600) {
  const point = new Vector3(x, 0, z).project(camera.camera);
  return { x: ((point.x + 1) / 2) * width, y: ((1 - point.y) / 2) * height, depth: point.z };
}

describe('Camera3D', () => {
  it('starts centered on Pac-Man with north up, the same horizontal scale, and a slight tilt', () => {
    const camera = createCamera();
    const center = project(camera, 400, 300);
    const east = project(camera, 416, 300);
    const south = project(camera, 400, 316);

    expect(center.x).toBeCloseTo(400);
    expect(Math.abs(center.y - 300)).toBeLessThanOrEqual(0.5);
    expect(east.x - center.x).toBeCloseTo(16 * 5);
    expect(east.y).toBeCloseTo(center.y);
    expect(south.x).toBeCloseTo(center.x);
    expect(south.y - center.y).toBeCloseTo(16 * 5 * VERTICAL_SCALE);
    expect(center.depth).toBeGreaterThan(-1);
    expect(center.depth).toBeLessThan(1);
  });

  it('views wall height from the right while keeping the maze grid straight', () => {
    const camera = createCamera();
    const direction = camera.camera.getWorldDirection(new Vector3());
    const leanDegrees = Math.atan2(-direction.x, -direction.y) * 180 / Math.PI;
    const base = new Vector3(400, 0, 300).project(camera.camera);
    const top = new Vector3(400, 12, 300).project(camera.camera);

    expect(leanDegrees).toBeCloseTo(5);
    expect(top.x).toBeLessThan(base.x);
    expect(top.y).toBeGreaterThan(base.y);
    expect(project(camera, 416, 300).y).toBeCloseTo(project(camera, 400, 300).y);
    expect(project(camera, 400, 316).x).toBeCloseTo(project(camera, 400, 300).x);
  });

  it('holds the same angle while following Pac-Man across the maze', () => {
    const target = { x: 400, y: 300 };
    const camera = createCamera(target);
    const orientation = camera.camera.quaternion.clone();

    for (const x of [150, 500, 850]) {
      target.x = x;
      for (let frame = 0; frame < 60; frame += 1) {
        camera.update();
        camera.present(0.37);
        expect(camera.camera.quaternion.angleTo(orientation)).toBeCloseTo(0, 6);
      }
    }
  });

  it.each([
    { width: 320, height: 640, zoom: 5 },
    { width: 1200, height: 800, zoom: 7 },
    { width: 2560, height: 1440, zoom: 2.5 },
  ])('preserves straight axes, scale, and picking after projection changes at $width × $height', ({ width, height, zoom }) => {
    const camera = createCamera();
    camera.setZoom(zoom);
    camera.setViewport(width, height);
    // Bounds changes also rebuild the projection to update the depth range.
    camera.setBounds(2000, 1600);
    camera.present(1, 1.25);
    const center = project(camera, 400, 300, width, height);
    const east = project(camera, 416, 300, width, height);
    const south = project(camera, 400, 316, width, height);

    expect(east.x - center.x).toBeCloseTo(16 * zoom);
    expect(east.y).toBeCloseTo(center.y);
    expect(south.x).toBeCloseTo(center.x);
    expect(south.y - center.y).toBeCloseTo(16 * zoom * VERTICAL_SCALE);
    const picked = camera.screenToWorld(center.x, center.y);
    expect(picked.x).toBeCloseTo(400);
    expect(picked.y).toBeCloseTo(300);

    camera.setViewport(width, height);
    camera.present(1, 1.25);
    expect(project(camera, 400, 300, width, height)).toEqual(center);
  });

  it('presents interpolated follow motion without changing its simulation position', () => {
    const target = { x: 400, y: 300 };
    const camera = createCamera(target);
    target.x += 40;
    target.y += 20;
    camera.update();
    const current = camera.getRenderPosition();

    camera.present(0.5);
    const focus = camera.screenToWorld(400, 300);

    expect(focus.x).toBeCloseTo(401.8);
    expect(Math.abs(focus.y - 300.9)).toBeLessThanOrEqual(0.5 / (5 * VERTICAL_SCALE));
    expect(camera.getRenderPosition()).toEqual(current);
    camera.present(1);
    expect(camera.screenToWorld(400, 300).x).toBeCloseTo(403.6);
  });

  it('picks the displayed ground position using CSS viewport coordinates', () => {
    const target = { x: 400, y: 300 };
    const camera = createCamera(target);
    const screen = project(camera, 430, 280);
    target.x += 100;
    camera.update();

    // A simulation update does not move the view until the next presented frame.
    const picked = camera.screenToWorld(screen.x, screen.y);
    expect(picked.x).toBeCloseTo(430);
    expect(picked.y).toBeCloseTo(280);
  });

  it.each([1, 1.25, 1.5, 2])('moves static maze geometry by whole physical pixels at DPR %s', (pixelRatio) => {
    const target = { x: 400, y: 300 };
    const camera = createCamera(target);
    const width = 801;
    const height = 603;
    camera.setViewport(width, height);
    camera.present(1, pixelRatio);
    const initial = project(camera, 100, 100, width, height);
    for (let frame = 0; frame < 20; frame += 1) {
      target.x += 0.37;
      target.y += 0.29;
      camera.update();
      const simulationPosition = camera.getRenderPosition();
      camera.present(0.63, pixelRatio);
      const screen = project(camera, 100, 100, width, height);
      const dx = (screen.x - initial.x) * Math.floor(width * pixelRatio) / width;
      const dy = (screen.y - initial.y) * Math.floor(height * pixelRatio) / height;
      expect(dx).toBeCloseTo(Math.round(dx));
      expect(dy).toBeCloseTo(Math.round(dy));
      expect(camera.getRenderPosition()).toEqual(simulationPosition);
      const picked = camera.screenToWorld(screen.x, screen.y);
      expect(picked.x).toBeCloseTo(100);
      expect(picked.y).toBeCloseTo(100);
    }
  });

  it('clamps the tilted ground footprint at large-map edges', () => {
    const camera = createCamera({ x: 995, y: 795 });
    const bottomRight = camera.screenToWorld(800, 600);
    expect(bottomRight.x).toBeCloseTo(1000);
    expect(bottomRight.y).toBeCloseTo(800);

    camera.startFollow({ x: 0, y: 0 }, 1, 1);
    camera.snapToFollowTarget();
    camera.present();
    const topLeft = camera.screenToWorld(0, 0);
    expect(topLeft.x).toBeCloseTo(0);
    expect(topLeft.y).toBeCloseTo(0);
  });

  it('centers a world smaller than the tilted viewport on both axes', () => {
    const camera = createCamera({ x: 0, y: 0 });
    camera.setBounds(100, 80);
    camera.snapToFollowTarget();
    camera.present();

    const center = camera.screenToWorld(400, 300);
    expect(center.x).toBeCloseTo(50);
    expect(center.y).toBeCloseTo(40);
    expect(project(camera, 50, 40).x).toBeCloseTo(400);
    expect(project(camera, 50, 40).y).toBeCloseTo(300);
  });

  it('resizes its projection and applies bounds independently on each axis', () => {
    const camera = createCamera({ x: 10, y: 700 });
    camera.setBounds(100, 800);
    camera.setViewport(1200, 900);
    camera.update();
    camera.present();

    const center = camera.screenToWorld(600, 450);
    expect(center.x).toBeCloseTo(50);
    expect(camera.screenToWorld(1200, 900).y).toBeLessThanOrEqual(800);
    const screen = project(camera, 50, center.y, 1200, 900);
    expect(screen.x).toBeCloseTo(600);
    expect(screen.y).toBeCloseTo(450);
    expect(project(camera, 66, center.y, 1200, 900).x - screen.x).toBeCloseTo(80);
  });

  it('keeps a very large maze within the camera depth range', () => {
    const camera = createCamera();
    camera.setBounds(20000, 20000);
    camera.startFollow({ x: 10000, y: 10000 }, 1, 1);
    camera.snapToFollowTarget();
    camera.present();

    for (const z of [0, 20000]) {
      const point = project(camera, 10000, z);
      expect(point.depth).toBeGreaterThan(-1);
      expect(point.depth).toBeLessThan(1);
    }
  });
});
