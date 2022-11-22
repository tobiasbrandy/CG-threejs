import * as THREE from './libs/three/three.module.js';

export function createSpotlights(scene) {
  const lightAreaSideX = 600;
  const lightAreaSideZ = 200;
  const xCount = 3;
  const zCount = 2;

  for (let i = 0; i < xCount; i++) {
    for (let k = 0; k < zCount; k++) {

      const x = lerp(- (lightAreaSideX / 2 - 1), (lightAreaSideX / 2 - 1), i / (xCount - 1));
      const y = 250
      const z = lerp(- (lightAreaSideZ / 2 - 1), (lightAreaSideZ / 2 - 1), k / (zCount - 1));

      createSpotLight(scene, x, y, z);
    }
  }
}

function createSpotLight(scene, x, y, z) {
  const group = new THREE.Group();

  const geometry = new THREE.CylinderGeometry(5, 5, 2);
  const material = new THREE.MeshBasicMaterial({ color: 0xBBBBBB });
  const cube = new THREE.Mesh(geometry, material);
  group.add(cube);

  const spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 4,  1);
  spotLight.target.position.set(x, 0 ,z);
  
  group.add(spotLight);
  scene.add(spotLight.target);

  group.position.set(x, y, z);

  scene.add(group);
}

function lerp(a, b, t) {
  return (a * (1.0 - t)) + (b * t);
}
