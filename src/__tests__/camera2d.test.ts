import { describe, expect, it } from 'vitest';
import { CAMERA } from '../config/constants';
import { Camera2D } from '../engine/camera';

describe('Camera2D', () => {
  it('snaps to follow target immediately on startup and clamps to bounds', () => {
    const camera = new Camera2D();
    const target = { x: 80, y: 80 };

    camera.setBounds(100, 100);
    camera.setViewport(50, 50);
    camera.setZoom(1);
    camera.startFollow(target, 0.09, 0.09);
    camera.snapToFollowTarget();

    expect(camera.x).toBe(50);
    expect(camera.y).toBe(50);
  });

  it('keeps normal interpolation behavior after startup snap', () => {
    const camera = new Camera2D();
    const target = { x: 150, y: 100 };

    camera.setBounds(300, 200);
    camera.setViewport(100, 100);
    camera.setZoom(1);
    camera.startFollow(target, 0.1, 0.1);
    camera.snapToFollowTarget();

    expect(camera.x).toBe(100);
    expect(camera.y).toBe(50);

    target.x = 190;
    target.y = 130;
    camera.update();

    expect(camera.x).toBeCloseTo(104, 5);
    expect(camera.y).toBeCloseTo(53, 5);
  });

  it('interpolates presentation between previous and current fixed-step positions', () => {
    const camera = new Camera2D();
    const target = { x: 150, y: 100 };

    camera.setBounds(300, 200);
    camera.setViewport(100, 100);
    camera.setZoom(1);
    camera.startFollow(target, 0.1, 0.1);
    camera.snapToFollowTarget();

    target.x = 190;
    target.y = 130;
    camera.update();

    expect(camera.getRenderPosition(0)).toEqual({ x: 100, y: 50 });
    expect(camera.getRenderPosition(0.5)).toEqual({ x: 102, y: 51.5 });
    expect(camera.getRenderPosition(1)).toEqual({ x: 104, y: 53 });
  });

  it('stops panning along the old axis shortly after the Packet turns or reverses', () => {
    const camera = new Camera2D();
    const target = { x: 500, y: 500 };
    camera.setBounds(2000, 2000);
    camera.setViewport(200, 200);
    camera.setZoom(1);
    camera.startFollow(target, CAMERA.followLerp.x, CAMERA.followLerp.y);
    camera.snapToFollowTarget();

    for (let step = 0; step < 40; step += 1) {
      target.x += 1;
      camera.update();
    }
    const beforeReversal = camera.x;
    for (let step = 0; step < 5; step += 1) {
      target.x -= 1;
      camera.update();
    }
    expect(camera.x).toBeLessThan(beforeReversal);

    for (let step = 0; step < 40; step += 1) {
      target.x += 1;
      camera.update();
    }
    for (let step = 0; step < 6; step += 1) {
      target.y += 1;
      camera.update();
    }
    expect(Math.abs(camera.x - (target.x - 100))).toBeLessThan(1);
    expect(camera.y).toBeGreaterThan(400);
  });

  it('clamps camera coordinates while following near world edges', () => {
    const camera = new Camera2D();
    const target = { x: -100, y: -100 };

    camera.setBounds(100, 100);
    camera.setViewport(80, 80);
    camera.setZoom(1);
    camera.startFollow(target, 1, 1);

    camera.update();
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);

    target.x = 500;
    target.y = 500;
    camera.update();

    expect(camera.x).toBe(20);
    expect(camera.y).toBe(20);
  });

  it('centers camera when viewport is larger than world on both axes', () => {
    const camera = new Camera2D();
    const target = { x: 50, y: 30 };

    camera.setBounds(100, 60);
    camera.setViewport(200, 160);
    camera.setZoom(1);
    camera.startFollow(target, 1, 1);

    camera.snapToFollowTarget();
    expect(camera.x).toBe(-50);
    expect(camera.y).toBe(-50);

    target.x = 500;
    target.y = 500;
    camera.update();
    expect(camera.x).toBe(-50);
    expect(camera.y).toBe(-50);
  });

  it('centers only undersized axes and clamps the others', () => {
    const camera = new Camera2D();
    const target = { x: 500, y: 500 };

    camera.setBounds(100, 200);
    camera.setViewport(200, 100);
    camera.setZoom(1);
    camera.startFollow(target, 1, 1);

    camera.update();
    expect(camera.x).toBe(-50);
    expect(camera.y).toBe(100);

    target.y = -500;
    camera.update();
    expect(camera.x).toBe(-50);
    expect(camera.y).toBe(0);
  });
});
