import { AnimationClip, BoxGeometry, Group, Mesh, MeshStandardMaterial, NumberKeyframeTrack } from 'three';
import { ArcadeAssets, type CharacterModels } from '../../game/infrastructure/three/ArcadeAssets';

export function createCharacterModels(): CharacterModels {
  const model = (name: keyof CharacterModels, width: number): CharacterModels['firewall'] => {
    const scene = new Group();
    scene.name = name;
    const material = new MeshStandardMaterial({ color: 0xffffff });
    material.name = 'identity-body';
    const body = new Mesh(new BoxGeometry(width, 8, width), material);
    body.name = 'body';
    body.position.y = 4;
    scene.add(body);
    const eyeGeometry = new BoxGeometry(0.8, 1.7, 0.15);
    const blink = eyeGeometry.attributes.position.clone();
    const scared = eyeGeometry.attributes.position.clone();
    blink.name = 'blink';
    scared.name = 'scared';
    for (let index = 0; index < scared.count; index += 1) {
      blink.setY(index, blink.getY(index) * 0.15);
      scared.setY(index, scared.getY(index) * 1.25);
    }
    eyeGeometry.morphAttributes.position = [blink, scared];
    const eyeMaterial = new MeshStandardMaterial({ color: 0xeaffff });
    eyeMaterial.name = 'eye-core';
    for (const [index, side] of ['left', 'right'].entries()) {
      const eye = new Mesh(eyeGeometry, eyeMaterial);
      eye.name = `eye-${side}`;
      eye.position.set(index === 0 ? -0.8 : 0.8, 8, 2);
      scene.add(eye);
    }
    return {
      scene,
      animations: [new AnimationClip('idle', 6, [
        new NumberKeyframeTrack('body.position[y]', [0, 3, 6], [4, 4.5, 4]),
        new NumberKeyframeTrack('eye-left.morphTargetInfluences[0]', [0, 3, 6], [0, 1, 0]),
        new NumberKeyframeTrack('eye-left.morphTargetInfluences[1]', [0, 3, 6], [0, 0.4, 0]),
      ])],
    };
  };
  return {
    firewall: model('firewall', 11), virus: model('virus', 11), ping: model('ping', 11),
    spam: model('spam', 11), lag: model('lag', 11), quarantine: model('quarantine', 11), trojan: model('trojan', 11),
  };
}

export function createCharacterAssets(): ArcadeAssets {
  return new ArcadeAssets(createCharacterModels());
}
