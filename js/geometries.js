import * as THREE from 'three';

const Y_AXIS      = new THREE.Vector3(0, 1, 0);
const POS_DIM     = 3;
const STEP_POINTS = 4;

class AbstractGeometry {
  constructor(type) {
    this.type = type;
  }
}

class RevolutionGeometry extends AbstractGeometry {
  constructor(code, curveSupplier) {
    super('revolution');

    this.code           = code;
    this.curveSupplier  = curveSupplier;
  }

  create(height, width, resolution, percentage) {  
    const curve = this.curveSupplier(height, width);
    
    const points = curve.getSpacedPoints(resolution);
    const pointCount = points.length;
    const stepCount = Math.ceil(pointCount * percentage / 100);
  
    return new THREE.LatheGeometry(points.slice(0, stepCount), 50);
  }
}

class ExcrutionGeometry extends AbstractGeometry {
  constructor(code, curveSupplier) {
    super('excrution');

    this.code           = code;
    this.curveSupplier  = curveSupplier;
  }

  create(height, width, resolution, angle, percentage, curveSampleCount) {
    const curve       = this.curveSupplier(width);
    const stepSize    = height / resolution;
    const angleStep   = THREE.MathUtils.degToRad(angle) / resolution;
    const basePoints  = curve.getPoints(curveSampleCount);
    const pointCount  = basePoints.length;
    const stepCount   = Math.ceil(resolution * percentage / 100);
  
    const position  = [];
    const index     = [];
    const normal    = [];

    let bottom = basePoints.map(v => new THREE.Vector3(v.x, 0, v.y));
    let top;
  
    // Position and index calculation
    for(let step = 0, idx = 0; step < stepCount; step++) {
      top = basePoints.map(v => new THREE.Vector3(v.x, (step + 1) * stepSize, v.y).applyAxisAngle(Y_AXIS, (step + 1) * angleStep));
  
      for(let i = 0; i < pointCount - 1; i++, idx += STEP_POINTS) {
        position.push(...bottom[i]    .toArray()); // left down
        position.push(...bottom[i + 1].toArray()); // right down
        position.push(...top[i]       .toArray()); // left up
        position.push(...top[i + 1]   .toArray()); // right up
    
        const leftDown  = idx + 0;
        const rightDown = idx + 1;
        const leftUp    = idx + 2;
        const rightUp   = idx + 3;
    
        index.push(
          leftDown, rightDown, leftUp,    // First triangle
          leftUp,   rightDown, rightUp,   // Second triangle
        );
      }
  
      bottom = top;
    }
  
    // Normal calculation
    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const pC = new THREE.Vector3();
  
    for(let i = 0; POS_DIM * i < position.length; i += STEP_POINTS) {
      pA.fromArray(position, POS_DIM * (i + 0));
      pB.fromArray(position, POS_DIM * (i + 1));
      pC.fromArray(position, POS_DIM * (i + 2));
      
      pC.sub(pB);
      pA.sub(pB);
      pC.cross(pA);
      pC.normalize();
      
      pC.toArray(normal, POS_DIM * (i + 0));
      pC.toArray(normal, POS_DIM * (i + 1));
      pC.toArray(normal, POS_DIM * (i + 2));
      pC.toArray(normal, POS_DIM * (i + 3));
    }
  
    // Buffer Geometry creation
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), POS_DIM));
    geometry.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array(normal),   POS_DIM));
    geometry.setIndex(index);
  
    return geometry;
  }
}

/* --------------------- Curves ------------------------ */

function A1curve(height, width) {
  const curve = new THREE.Path();
  const d = width / 2 / 10;
  const h = height / 10;

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(0, 0),
      new THREE.Vector2(8 * d, 0)
  ));

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(8 * d, 0),
      new THREE.Vector2(8 * d, 2 * h)
  ));

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(8 * d, 2 * h),
      new THREE.Vector2(2*d, 2.5 * h)
  ));


  curve.add(new THREE.CubicBezierCurve(
      new THREE.Vector2(2*d, 2.5 * h),
      new THREE.Vector2(7*d, 2.5 * h),
      new THREE.Vector2(7*d, 7.5 * h),
      new THREE.Vector2(2*d, 7.5 * h)
  ));

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(2*d, 7.5 * h),
      new THREE.Vector2(8 * d, 8 * h)
  ));

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(8 * d, 8 * h),
      new THREE.Vector2(8 * d, 10 * h),
  ));

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(8 * d, 10 * h),
      new THREE.Vector2(0, 10 * h)
  ));

  return curve;
}

function B1curve(length) {
  const len = length/2;
  const rot = 2/3*Math.PI;

  const curve = new THREE.Path();
  curve.moveTo(len * Math.cos(1*rot), len * Math.sin(1*rot));
  curve.lineTo(len * Math.cos(2*rot), len * Math.sin(2*rot));
  curve.lineTo(len * Math.cos(3*rot), len * Math.sin(3*rot));
  curve.closePath();

  return curve;
}

/* ------------ Exports ---------------- */

export default {
  'A1': new RevolutionGeometry('A1', A1curve),
  'B1': new ExcrutionGeometry ('B1', B1curve),
};