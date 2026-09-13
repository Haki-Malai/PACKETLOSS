import { Color, DirectionalLight, HemisphereLight, MeshStandardMaterial, Scene } from 'three';

export function addGameplayLighting(scene: Scene): void {
  scene.background = new Color('#02040b');
  scene.add(new HemisphereLight('#a7c5ff', '#160b30', 0.85));
  const key = new DirectionalLight('#c7dfff', 1.4);
  key.position.set(-150, 300, 100);
  scene.add(key);
}

export function createMazeFloorMaterial(): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: '#050912', roughness: 0.86 });
}
