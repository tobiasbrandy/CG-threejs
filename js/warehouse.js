import * as THREE from './libs/three/three.module.js';

import { textureLoader, tiled } from './textures.js';

export function createWarehouse(wallSize, wallDistance) {
  const warehouse = new THREE.Group();

  const plane = new THREE.BoxGeometry(wallSize, wallSize, 1);

  const floorM = new THREE.MeshPhongMaterial({
    map:        tiled(textureLoader.load('warehouse/floor.png'),        10),
    normalMap:  tiled(textureLoader.load('warehouse/floor_normal.png'), 10),
  });

  const floor = new THREE.Mesh(plane, floorM);
  floor.rotateX(-Math.PI/2);
  floor.position.y = 0;
  floor.receiveShadow = true;
  warehouse.add(floor);

  const walls = new THREE.Group();
  const wallM = new THREE.MeshLambertMaterial({
    map:        tiled(textureLoader.load('warehouse/wall.png'),         10),
    normalMap:  tiled(textureLoader.load('warehouse/wall_normal.png'),  10),
  }); 

  const wall1 = new THREE.Mesh(plane, wallM);
  wall1.rotateX(-Math.PI);
  wall1.position.y = wallSize/2;
  wall1.position.z = wallDistance;
  wall1.receiveShadow = true;
  walls.add(wall1);

  const wall2 = new THREE.Mesh(plane, wallM);
  wall2.rotateX(-Math.PI);
  wall2.position.y = wallSize/2;
  wall2.position.z = -wallDistance;
  wall2.receiveShadow = true;
  walls.add(wall2);

  const wall3 = new THREE.Mesh(plane, wallM);
  wall3.rotateX(-Math.PI);
  wall3.rotateY(Math.PI/2);
  wall3.position.x = -wallDistance;
  wall3.position.y = wallSize/2;
  wall3.receiveShadow = true;
  walls.add(wall3);

  const wall4 = new THREE.Mesh(plane, wallM);
  wall4.rotateX(-Math.PI);
  wall4.rotateY(Math.PI/2);
  wall4.position.x = wallDistance;
  wall4.position.y = wallSize/2;
  wall4.receiveShadow = true;
  walls.add(wall4);

  warehouse.add(walls);

  return warehouse;
}
