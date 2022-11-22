import * as THREE from './libs/three/three.module.js';

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
    
    const points      = curve.getSpacedPoints(resolution);
    const pointCount  = points.length;
    const stepCount   = Math.ceil(pointCount * percentage / 100);
    const geomPoints  = points.slice(0, stepCount);
    const segments    = pointCount;

    // UV
    const uv = [];
    for(let i = 0; i <= segments; i++) {
			for(let j = 0; j <= stepCount - 1; j++) {
        uv.push(i / segments, j / (pointCount - 1));
      }
    }
  
    const geometry = new THREE.LatheGeometry(geomPoints, segments);
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));

    return geometry;
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
    const basePoints  = curve.getSpacedPoints(curveSampleCount);
    const pointCount  = basePoints.length;
    const stepCount   = Math.ceil(resolution * percentage / 100);
  
    const position  = [];
    const uv        = [];
    const index     = [];
    const normal    = [];

    let bottom = basePoints.map(v => new THREE.Vector3(v.x, 0, v.y));
    let top;
  
    // Position, uv and index calculation
    for(let step = 0, idx = 0; step < stepCount; step++) {
      top = basePoints.map(v => new THREE.Vector3(v.x, (step + 1) * stepSize, v.y).applyAxisAngle(Y_AXIS, (step + 1) * angleStep));
  
      for(let i = 0; i < pointCount - 1; i++, idx += STEP_POINTS) {
        // Position
        position.push(...bottom[i]    .toArray()); // left down
        position.push(...bottom[i + 1].toArray()); // right down
        position.push(...top[i]       .toArray()); // left up
        position.push(...top[i + 1]   .toArray()); // right up

        // UV
        const uLeft   = i;
        const uRight  = i + 1;
        const uMod    = pointCount - 1;
        const vBot    = step;
        const vTop    = step + 1;
        const vMod    = resolution;

        uv.push(uLeft   / uMod, vBot / vMod); // left down
        uv.push(uRight  / uMod, vBot / vMod); // right down
        uv.push(uLeft   / uMod, vTop / vMod); // left up
        uv.push(uRight  / uMod, vTop / vMod); // right up

        // Index
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
    geometry.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(uv),       2));
    geometry.setIndex(index);
  
    return geometry;
  }
}

/* --------------------- Curves ------------------------ */

function createA1Curve(height, width) {
  const d = width / 2 / 10;
  const h = height / 10;

  const curve = new THREE.Path();

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

function createA2Curve(height, width) {
  const d = width / 2 / 10;
  const h = height / 8;

  const curve = new THREE.CurvePath();

  curve.add(new THREE.SplineCurve([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(4 * d, 0),
      new THREE.Vector2(5 * d, h),
      new THREE.Vector2(3 * d, 5 * h),
      new THREE.Vector2(5 * d, 7 * h),
      new THREE.Vector2(4 * d, 7.5 * h),
      new THREE.Vector2(3.8 * d, 8 * h)
  ]));

  return curve;
}

function createA3Curve(height, width) {
  const d = width / 2 / 10;
  const h = height / 9;

  const curve = new THREE.CurvePath();

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(0, 0),
      new THREE.Vector2(10 * d, 0)
  ));

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(10 * d, 0),
      new THREE.Vector2(3 * d, h)
  ));

  curve.add(new THREE.LineCurve(
      new THREE.Vector2(3 * d, h),
      new THREE.Vector2(3 * d, 2 * h)
  ));

  curve.add(new THREE.SplineCurve([
      new THREE.Vector2(3 * d, 2 * h),
      new THREE.Vector2(6 * d, 3 * h),
      new THREE.Vector2(6 * d, 7 * h),
      new THREE.Vector2(4 * d, 8 * h),
      new THREE.Vector2(d, 9 * h)
  ]));

  return curve;
}

function createA4Curve(height, width) {
  const d = width / 2 / 10;
  const h = height / 7.3;

  const curve = new THREE.CurvePath();

  curve.add(new THREE.SplineCurve([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(5 * d, 0),
      new THREE.Vector2(6 * d, 0.5 * h),
      new THREE.Vector2(6 * d, 1.5 * h),
      new THREE.Vector2(5 * d, 2 * h),
      new THREE.Vector2(3 * d, 2.2 * h),
      new THREE.Vector2(2.8 * d, 2.6* h),
      new THREE.Vector2(5 * d, 3.5 * h),
      new THREE.Vector2(8 * d, 4 * h),
  ]));
  
  curve.add(new THREE.SplineCurve([
      new THREE.Vector2(8 * d, 4 * h),
      new THREE.Vector2(4 * d, 4.3 * h),
      new THREE.Vector2(3* d, 6.5 * h),
      new THREE.Vector2(2.5* d, 7 * h),
      new THREE.Vector2(0, 7.3 * h),
  ]));

  return curve;
}

function createB1Curve(length) {
  const len = length/2;
  const rot = 2/3*Math.PI;

  const curve = new THREE.Path();
  
  curve.moveTo(len * Math.cos(1*rot), len * Math.sin(1*rot));
  curve.lineTo(len * Math.cos(2*rot), len * Math.sin(2*rot));
  curve.lineTo(len * Math.cos(3*rot), len * Math.sin(3*rot));
  curve.closePath();

  return curve;
}

function createB2Curve(length) {
  const n     = 7;
  const long  = length * 3 / 4;
  const short = length * 3 / 8;

  const curve = new THREE.Path();

  curve.moveTo(long, 0);

  for(let i = 1; i <= 2 * n; i +=2) {
    const a1 = (i + 0) / n * Math.PI;
    const a2 = (i + 1) / n * Math.PI;

    curve.quadraticCurveTo(
      Math.cos(a1) * short,  Math.sin(a1) * short, 
      Math.cos(a2) * long,   Math.sin(a2) * long,
    );
  }

  return curve;
}

function createB3Curve(length) {
  const d = length / 13;

  const curve = new THREE.Path();

  curve.moveTo(-3 * d, -2 * d);
  curve.lineTo(-6 * d, -2 * d);
  curve.splineThru([
      new THREE.Vector2(-6 * d, -2 * d),
      new THREE.Vector2(-6 * d, -6 * d),
      new THREE.Vector2(-2 * d, -6 * d),
  ]);
  curve.lineTo(-2 * d, -3 * d);
  curve.lineTo(2 * d, -3 * d);
  curve.lineTo(2 * d, -6 * d);
  curve.splineThru([
      new THREE.Vector2(2 * d, -6 * d),
      new THREE.Vector2(6 * d, -6 * d),
      new THREE.Vector2(6 * d, -2 * d),
  ]);
  curve.lineTo(3 * d, -2 * d);
  curve.lineTo(3 * d, 2 * d);
  curve.lineTo(6 * d, 2 * d);
  curve.splineThru([
      new THREE.Vector2(6 * d, 2 * d),
      new THREE.Vector2(6 * d, 6 * d),
      new THREE.Vector2(2 * d, 6 * d),
  ]);
  curve.lineTo(2 * d, 3 * d);
  curve.lineTo(-2 * d, 3 * d);
  curve.lineTo(-2 * d, 6 * d);
  curve.splineThru([
      new THREE.Vector2(-2 * d, 6 * d),
      new THREE.Vector2(-6 * d, 6 * d),
      new THREE.Vector2(-6 * d, 2 * d),
  ]);
  curve.lineTo(-3 * d, 2 * d);
  curve.closePath();

  return curve;
}

function createB4Curve(length) {
  const d = length / 11;

  const curve = new THREE.Path();

  curve.moveTo(-d, -4 * d);
  curve.absarc(
      0, -4 * d,
      d,
      Math.PI, 0
  );
  curve.lineTo(d, 4 * d);
  curve.absarc(
      0, 4 * d,
      d,
      0, Math.PI
  );
  curve.closePath();

  return curve;
}

/* ------------ Exports ---------------- */

export default {
  'A1': new RevolutionGeometry('A1', createA1Curve),
  'A2': new RevolutionGeometry('A2', createA2Curve),
  'A3': new RevolutionGeometry('A3', createA3Curve),
  'A4': new RevolutionGeometry('A4', createA4Curve),
  'B1': new ExcrutionGeometry ('B1', createB1Curve),
  'B2': new ExcrutionGeometry ('B2', createB2Curve),
  'B3': new ExcrutionGeometry ('B3', createB3Curve),
  'B4': new ExcrutionGeometry ('B4', createB4Curve),
};