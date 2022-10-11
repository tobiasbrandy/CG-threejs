import * as THREE from './libs/three/three.module.js';

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

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.baseHeight, SEGMENTS),
      new THREE.MeshLambertMaterial({ color: 0x999999 })
    );
    base.position.y -= this.baseHeight/2;
    this.mesh.add(base);

    const lift = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius/10, this.radius/10, this.liftHeight, SEGMENTS),
      new THREE.MeshLambertMaterial({ color: 0xffdd00 })
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
    const top = new THREE.Mesh(new THREE.BoxGeometry(topLen, topWidth, topLen), greenM);
    top.position.x = handle2.position.x;
    top.position.y -= handleSize/2;
    head.add(top);

    head.position.y += handleSize/2 + topWidth;

    return head;
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
