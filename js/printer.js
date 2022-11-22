import * as THREE from './libs/three/three.module.js';

import { textureLoader, cubeTextureLoader } from './textures.js';
import PieceSlot from './pieceSlot.js';

const SEGMENTS          = 32;
const PROGRESS_STEP     = 5;
const PROGRESS_INTERVAL = 50; // millis

const TOP_WIDTH   = 2/3;
const HANDLE_SIZE = 5;


export default class Printer {
  constructor(position, radius, baseHeight, liftHeight) {
    this.radius     = radius;
    this.baseHeight = baseHeight;
    this.liftHeight = liftHeight;
    this.pieceProgress = 0;

    this.mesh = new THREE.Group();
    this.mesh.position.copy(position);
    this.mesh.position.y += this.baseHeight;

    this.pieceSlot = new PieceSlot();
    this.mesh.add(this.pieceSlot.mesh);

    const textureCube = cubeTextureLoader.load([
      'printer/body_env_right.jpg',
      'printer/body_env_left.jpg',
      'printer/body_env_top.jpg',
      'printer/body_env_bottom.jpg',
      'printer/body_env_front.jpg',
      'printer/body_env_back.jpg', 
    ]);
    textureCube.format  = THREE.RGBAFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;

    const baseG = new THREE.CylinderGeometry(this.radius, this.radius, this.baseHeight, SEGMENTS);
    const baseM = new THREE.MeshPhongMaterial({ 
      specular:     0x888888,
      shininess:    120,
      envMap:       textureCube,
      reflectivity: 1,
      emissive:     0x333333,
      map:          textureLoader.load('printer/body.png'),
    });
    const base = new THREE.Mesh(baseG, baseM);
    base.position.y -= this.baseHeight/2;
    this.mesh.add(base);

    const liftM = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
    const lift = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius/10, this.radius/10, this.liftHeight, SEGMENTS),
      liftM
    );
    lift.position.x -= 4/5*this.radius;
    lift.position.y += this.liftHeight/2;
    this.mesh.add(lift);

    this.liftPos = lift.position;
    this.head = this.createHead(this.liftPos);
    this.head.position.x = this.liftPos.x;
    this.mesh.add(this.head);
  }

  createHead() {
    const blueM   = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
    const greenM  = new THREE.MeshLambertMaterial({ color: 0x0000FF });

    const handleSize  = HANDLE_SIZE;
    const topWidth    = TOP_WIDTH;

    const head = new THREE.Group();
    
    const handle = new THREE.Mesh(new THREE.BoxGeometry(handleSize, handleSize, handleSize), greenM);
    head.add(handle);

    const barSize = this.radius - 2*handleSize;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barSize, handleSize/3, handleSize), blueM);
    bar.position.x = barSize/2 + handleSize/2;
    head.add(bar);

    const handle2 = new THREE.Mesh(new THREE.BoxGeometry(handleSize, handleSize, handleSize), greenM);
    handle2.position.x = bar.position.x + barSize/2 + handleSize/2;
    head.add(handle2);

    const topLen = 4/5*this.radius;
    const topGroup = new THREE.Group();

    const top = new THREE.Mesh(new THREE.BoxGeometry(topLen, topWidth, topLen), greenM);
    topGroup.add(top);

    topGroup.add(this.createTopLight(new THREE.Vector3( topLen/2, topWidth/2,  topLen/2)));
    topGroup.add(this.createTopLight(new THREE.Vector3(-topLen/2, topWidth/2,  topLen/2)));
    topGroup.add(this.createTopLight(new THREE.Vector3( topLen/2, topWidth/2, -topLen/2)));
    topGroup.add(this.createTopLight(new THREE.Vector3(-topLen/2, topWidth/2, -topLen/2)));

    topGroup.position.x  = handle2.position.x;
    topGroup.position.y -= handleSize/2;
    head.add(topGroup);

    head.position.y += handleSize/2 + topWidth;

    return head;
  }

  createTopLight(position) {
    const ret = new THREE.Group();

    const light = new THREE.PointLight(0x0000FF, 1, 40);
    ret.add(light);

    const bodyG = new THREE.SphereGeometry(1);
    const bodyM = new THREE.MeshBasicMaterial({ color: 0x3333FF });
    const body = new THREE.Mesh(bodyG, bodyM);
    ret.add(body);

    ret.position.copy(position);
    return ret;
  }

  renderPiece(geomBuilder, height, width, resolution, angle, material, curveSampleCount = 50) {
    if(this.inProgress()) {
      return;
    }

    this.renderPieceRecr(geomBuilder, height, width, resolution, angle, material, curveSampleCount);
  }

  renderPieceRecr(geomBuilder, height, width, resolution, angle, material, curveSampleCount) {
    this.pieceProgress += PROGRESS_STEP;

    this.head.position.y = this.liftPos.y + Math.ceil(height*this.pieceProgress/100) - this.liftHeight/2 + HANDLE_SIZE/2 + TOP_WIDTH;

    const pieceGeometry = this.createPieceGeometry(geomBuilder, height, width, resolution, angle, this.pieceProgress, curveSampleCount);
    this.pieceSlot.setPiece(new THREE.Mesh(pieceGeometry, material));

    if(this.pieceProgress >= 100) {
      this.pieceProgress = 0;
    } else {
      setTimeout(() => this.renderPieceRecr(geomBuilder, height, width, resolution, angle,material, curveSampleCount), PROGRESS_INTERVAL);  
    }
  }

  createPieceGeometry(geomBuilder, height, width, resolution, angle, percentage, curveSampleCount) {
    switch(geomBuilder.type) {
      case 'excrution': {
        return geomBuilder.create(height, width, resolution, angle, percentage, curveSampleCount);
      }
      case 'revolution': {
        return geomBuilder.create(height, width, resolution, percentage);
      }
      default: throw new Error('Unsupported geomBuilder type: ' + geomBuilder.type);
    }
  }

  inProgress() {
    return this.pieceProgress !== 0;
  }
}
