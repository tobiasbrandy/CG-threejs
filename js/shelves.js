import * as THREE from './libs/three/three.module.js';

import { textureLoader, tiled } from './textures.js';
import PieceSlot from './pieceSlot.js';

const MIN_HEIGHT = 20;
const SHELF_H = 40;
const SHELF_W = 20;

export default class Shelves {
  constructor(position, height, width) {
    this.slots = [];
    this.mesh = new THREE.Group();

    for(let i = 0; i < width; i++) {
      for(let j = 0; j < height; j++) {
        const slot = new PieceSlot();
        slot.mesh.position.x = SHELF_W * i + SHELF_W/2;
        slot.mesh.position.y = MIN_HEIGHT + SHELF_H * j;
        this.mesh.add(slot.mesh);
        this.slots.push(slot);
      }
    }

    const colM    = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
    const shelfM  = new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('shelves/shelf.png'), 10) });

    const colG    = new THREE.BoxGeometry(1, MIN_HEIGHT + height * SHELF_H, 1);
    const shelfG  = new THREE.BoxGeometry(width * SHELF_W, 1, SHELF_W);

    for(let i = 0; i <= width; i++) {
      const col1 = new THREE.Mesh(colG, colM);
      col1.position.z += SHELF_W/2;
      col1.position.x += i*SHELF_W;
      col1.position.y += (MIN_HEIGHT + height * SHELF_H)/2;
      this.mesh.add(col1);

      const col2 = new THREE.Mesh(colG, colM);
      col2.position.z -= SHELF_W/2;
      col2.position.x += i*SHELF_W;
      col2.position.y += (MIN_HEIGHT + height * SHELF_H)/2;
      this.mesh.add(col2); 
    }

    for(let j = 0; j <= height; j++) {
      const shelf = new THREE.Mesh(shelfG, shelfM);
      shelf.position.x += width * SHELF_W / 2
      shelf.position.y = MIN_HEIGHT + j*SHELF_H;
      this.mesh.add(shelf); 
    }

    this.mesh.position.copy(position);
    this.mesh.rotateY(Math.PI/2);
  }
}