import * as THREE from 'three';

import PieceSlot from './pieceSlot.js';

const CAR_SPEED   = 2;
const LIFT_SPEED  = 1;
const ROT_SPEED   = 0.02;
const WHEEL_SPEED = 0.04;

const LIFT_MIN = 10;

const CLOSE_DIST_EPS = 50;

export default class Forklift {
  constructor(position, height, width, length) {
    this.height     = height;
    this.pieceSlot  = new PieceSlot();
    this.mesh       = this.createMesh(position, width, length);
    this.speed      = 0;
    this.rotSpeed   = 0;
    this.liftSpeed  = 0;
  }

  createMesh(position, width, length) {
    const mesh = new THREE.Group();

    const main = new THREE.Mesh(
      new THREE.BoxGeometry(length, 15, width),
      new THREE.MeshLambertMaterial({ color: 0x0000FF })
    );
    main.position.y = 12;
    mesh.add(main);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(33, 12, 24),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    cabin.position.x = -6;
    cabin.position.y = 25.5;
    mesh.add(cabin);

    const lift = this.createLift(width);
    lift.position.x = length/2;
    mesh.add(lift);

    this.wheels = this.createWheels(width, length);
    this.wheels.forEach(w => mesh.add(w));

    mesh.position.copy(position);

    return mesh;
  }

  createLift(width) {
    const spacing = width*1/4;
    const barCount = 3;

    const lift = new THREE.Group();

    const colM    = new THREE.MeshLambertMaterial({ color: 0x00FFFF });
    const barM    = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
    const plateM  = new THREE.MeshLambertMaterial({ color: 0xFF0000 });

    const colG    = new THREE.BoxGeometry(1, this.height, 3);
    const plateG  = new THREE.BoxGeometry(spacing * 4, 0.5, spacing * 4);
    const barG    = new THREE.BoxGeometry(2, 2, spacing * 2);

    const col1 = new THREE.Mesh(colG, colM);
    col1.position.z = spacing;
    col1.position.y = this.height/2;
    lift.add(col1);

    const col2 = new THREE.Mesh(colG, colM);
    col2.position.z = -spacing;
    col2.position.y = this.height/2;
    lift.add(col2);

    for(let i = 0; i < barCount; i++) {
      const bar = new THREE.Mesh(barG, barM);
      const unit = (this.height-2)/3;
      bar.position.y = LIFT_MIN + i*unit;
      lift.add(bar);
    }

    this.lift = new THREE.Group();
    this.lift.add(new THREE.Mesh(plateG, plateM));
    this.lift.add(this.pieceSlot.mesh);
    this.lift.position.x = spacing;
    this.lift.position.y = LIFT_MIN;
    lift.add(this.lift);

    return lift;
}

  createWheels(zLen, xLen, radius = 6, width = 2) {
    const frontRight = this.createWheel(radius, width, 1);
    frontRight.position.x = 2/5*xLen;
    frontRight.position.z = zLen/2;

    const frontLeft = this.createWheel(radius, width, -1);
    frontLeft.position.x = 2/5*xLen;
    frontLeft.position.z = -zLen/2;

    const backRight = this.createWheel(radius, width, 1);
    backRight.position.x = -2/5*xLen;
    backRight.position.z = zLen/2;

    const backLeft = this.createWheel(radius, width, -1);
    backLeft.position.x = -2/5*xLen;
    backLeft.position.z = -zLen/2;

    return [frontRight, frontLeft, backRight, backLeft];
  }

  createWheel(radius, width, side) {
    const wheel = new THREE.Group();

    const geom = new THREE.CylinderGeometry(radius, radius, width, 32);
    const mat = new THREE.MeshLambertMaterial({ color: 0x999999 });
    wheel.add(new THREE.Mesh(geom, mat));

    const pGeom = new THREE.CylinderGeometry(radius/10, radius/10, width/10, 32);
    const pMat = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const pMesh = new THREE.Mesh(pGeom, pMat);
    pMesh.position.x -= 4/5*radius;
    pMesh.position.y += width/2;
    wheel.add(pMesh);

    wheel.rotateX(side * Math.PI/2);
    wheel.position.y += radius;

    return wheel;
  }

  handlePiece(slots) {
    const hasPiece = this.pieceSlot.hasPiece();

    let min = Infinity;
    let minSlot = null;

    for(const slot of slots.filter(slot => hasPiece != slot.hasPiece())) {
      const dist = this.pieceSlot.distance(slot);
      if(dist < min) {
        min = dist;
        minSlot = slot;
      }
    }

    if(min > CLOSE_DIST_EPS) {
      return;
    }

    if(hasPiece) {
      minSlot.setPiece(this.pieceSlot.piece);
      this.pieceSlot.removePiece();
    } else {
      this.pieceSlot.setPiece(minSlot.piece);
      minSlot.removePiece();
    }
  }

  startForward() {
    this.speed = CAR_SPEED;
  }

  startBackwards() {
    this.speed = -CAR_SPEED;
  }

  stop() {
    this.speed = 0;
  }

  move() {
    if(!this.speed) {
      return;
    }

    this.mesh.translateX(this.speed);

    const rotSpeed = Math.sign(this.speed) * WHEEL_SPEED * 2*Math.PI;
    this.wheels[0].rotateY(-rotSpeed);
    this.wheels[1].rotateY(rotSpeed);
    this.wheels[2].rotateY(-rotSpeed);
    this.wheels[3].rotateY(rotSpeed);
  }

  rotateRight() {
    this.rotSpeed = -ROT_SPEED;
  }

  rotateLeft() {
    this.rotSpeed = ROT_SPEED;
  }

  stopRot() {
    this.rotSpeed = 0;
  }

  rotate() {
    if(!this.rotSpeed) {
      return;
    }

    this.mesh.rotateY(this.rotSpeed *2*Math.PI);
  }

  startLiftUp() {
    this.liftSpeed = LIFT_SPEED;
  }

  startLiftDown() {
    this.liftSpeed = -LIFT_SPEED;
  }

  stopLift() {
    this.liftSpeed = 0;
  }

  moveLift() {
    if(!this.liftSpeed || (this.lift.position.y <= LIFT_MIN && this.liftSpeed < 0) || (this.lift.position.y >= this.height && this.liftSpeed > 0)) {
      return;
    }

    this.lift.translateY(this.liftSpeed);

    if(this.lift.position.y <= LIFT_MIN) {
      this.lift.position.y = LIFT_MIN;
    } else if(this.lift.position.y >= this.height) {
      this.lift.position.y = this.height;
    }
  }

  update() {
    this.move();
    this.rotate();
    this.moveLift();
  }
}
