import * as THREE from 'three';

export default class PieceSlot {
  constructor() {
    this.mesh = new THREE.Group();
    this.piece = null;
  }

  setPiece(piece) {
    if(this.piece) {
      this.mesh.remove(this.piece);
    }
    this.piece = piece;
    this.mesh.add(this.piece);
  }

  removePiece() {
    if(this.piece) {
      this.mesh.remove(this.piece);
      this.piece = null;
    }
  }

  hasPiece() {
    return !!this.piece;
  }

  getPosition() {
    const ret = new THREE.Vector3();
    this.mesh.getWorldPosition(ret);
    return ret;
  }

  distance(slot) {
    return this.getPosition().distanceTo(slot.getPosition());
  }
}
