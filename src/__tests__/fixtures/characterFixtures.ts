import { AnimationClip, BoxGeometry, Group, Mesh, MeshStandardMaterial, NumberKeyframeTrack } from 'three';
import { ArcadeAssets, type CharacterModels } from '../../game/infrastructure/three/ArcadeAssets';

export function createCharacterModels(): CharacterModels {
  const model = (name: keyof CharacterModels, width: number): CharacterModels['block'] => {
    const scene = new Group();
    scene.name = name;
    const material = new MeshStandardMaterial({ color: 0xffffff });
    material.name = 'identity-body';
    const body = new Mesh(new BoxGeometry(width, 8, width), material);
    body.name = 'body';
    body.position.y = 4;
    scene.add(body);
    return {
      scene,
      animations: [new AnimationClip('idle', 6, [
        new NumberKeyframeTrack('body.position[y]', [0, 3, 6], [4, 4.5, 4]),
      ])],
    };
  };
  return { block: model('block', 11), virus: model('virus', 11) };
}

export function createCharacterAssets(): ArcadeAssets {
  return new ArcadeAssets(createCharacterModels());
}
