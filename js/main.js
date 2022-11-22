import * as THREE from './libs/three/three.module.js';
import { OrbitControls } from './libs/three/addons/controls/OrbitControls.js';
import { GUI } from './libs/gui/dat.gui.module.js';

import { textureLoader, tiled } from './textures.js';
import geometries from './geometries.js';
import Printer from './printer.js';
import Forklift from './forklift.js';
import bindInputHandlers from './input.js';
import Shelves from './shelves.js';
import { createWarehouse } from './warehouse.js';
import { createSpotlights } from './spotlights.js';

const initWindowRatio = window.innerWidth / window.innerHeight;

const materials = {
  wireframe:  new THREE.MeshBasicMaterial({ wireframe: true }),
  flat:       new THREE.MeshPhongMaterial({ specular: 0x000000, flatShading: true, side: THREE.DoubleSide }),
  smooth:     new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }),
  glossy:     new THREE.MeshPhongMaterial({ color: 0xAA0000, side: THREE.DoubleSide }),
  wave:       new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('geometry/wave_A.png'),    3),   side: THREE.DoubleSide }),
  circleA:    new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('geometry/circle_A.png'),  15),  side: THREE.DoubleSide }),
  circleB:    new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('geometry/circle_B.png'),  15),  side: THREE.DoubleSide }),
  circleC:    new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('geometry/circle_C.png'),  15),  side: THREE.DoubleSide }),
  diamondA:   new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('geometry/diamond_A.png'), 15),  side: THREE.DoubleSide }),
  diamondB:   new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('geometry/diamond_B.png'), 15),  side: THREE.DoubleSide }),
  diamondC:   new THREE.MeshPhongMaterial({ map: tiled(textureLoader.load('geometry/diamond_C.png'), 15),  side: THREE.DoubleSide }),
  marbleA:    new THREE.MeshPhongMaterial({ map: textureLoader.load('geometry/marble_A.png'),              side: THREE.DoubleSide }),
  marbleB:    new THREE.MeshPhongMaterial({ map: textureLoader.load('geometry/marble_B.png'),              side: THREE.DoubleSide }),
};

const guiController = {
  geoCode:        'B1',
  geoAngle:       180,
  geoHeight:      30,
  geoWidth:       10,
  geoResolution:  100,
  geoMaterial:    'glossy',
  render:         () => printer.renderPiece(
    geometries[guiController.geoCode],
    guiController.geoHeight,
    guiController.geoWidth,
    guiController.geoResolution,
    guiController.geoAngle,
    materials[guiController.geoMaterial],
  ),
};

const printer = new Printer(
  new THREE.Vector3(-100, 0, 0),
  50/3,
  40/3,
  100/3
);
const forklift = new Forklift(
  new THREE.Vector3(0, 0, 0),
  100,
  30,
  60,
);
const shelves = new Shelves(
  new THREE.Vector3(100, 0, 80),
  2,
  8
);

const customCams = {
  carDriver:  createDriverCamera(),
  carBack:    createBackCamera(),
  carSide:    createSideCamera(),
}

let baseCamera, cameraControls;
let scene, renderer, camera;

;(function() {
  const container = document.getElementById('container');

  const canvasWidth   = window.innerWidth;
  const canvasHeight  = window.innerHeight;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // Resize
  window.addEventListener('resize', onWindowResize);

  // Camera
  baseCamera = new THREE.PerspectiveCamera(100, initWindowRatio, 1, 2000);

  // Camera controlls
  cameraControls = new OrbitControls(baseCamera, renderer.domElement);
  cameraControls.minDistance = 50;
  cameraControls.maxDistance = 400;
  cameraControls.enablePan = false;

  // Default camera
  setSceneCamera();

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  scene.add(new THREE.AmbientLight(0x333333, 0.5));
  createSpotlights(scene);

  scene.add(printer.mesh);
  scene.add(forklift.mesh);
  scene.add(shelves.mesh);
  scene.add(createWarehouse(3000, 400))

  setupGui();

  bindInputHandlers({
    KeyW:   { down: () => forklift.startForward(),        up: () => forklift.stop()     },
    KeyS:   { down: () => forklift.startBackwards(),      up: () => forklift.stop()     },
    KeyA:   { down: () => forklift.rotateLeft(),          up: () => forklift.stopRot()  },
    KeyD:   { down: () => forklift.rotateRight(),         up: () => forklift.stopRot()  },
    KeyQ:   { down: () => forklift.startLiftUp(),         up: () => forklift.stopLift() },
    KeyE:   { down: () => forklift.startLiftDown(),       up: () => forklift.stopLift() },
    KeyG:   { down: () => forklift.handlePiece(availableSlots()), up: () => {}          },
    KeyO:   { down: () => cameraControls.zoomIn(),        up: () => {}                  },
    KeyP:   { down: () => cameraControls.zoomOut(),       up: () => {}                  },
    Digit1: { down: () => setSceneCamera(),               up: () => {}                  },
    Digit2: { down: () => setPrinterCamera(),             up: () => {}                  },
    Digit3: { down: () => setShelvesCamera(),             up: () => {}                  },
    Digit4: { down: () => camera = customCams.carDriver,  up: () => {}                  },
    Digit5: { down: () => camera = customCams.carBack,    up: () => {}                  },
    Digit6: { down: () => camera = customCams.carSide,    up: () => {}                  },
  });

  render();
})();

function availableSlots() {
  if(printer.inProgress()) {
    return shelves.slots;
  } else {
    return [...shelves.slots, printer.pieceSlot];
  }
}

function setupGui() {
  let gui = new GUI();

  let geoGui = gui.addFolder('Geometries');
  geoGui.add(guiController, 'geoCode',         Object.keys(geometries)).name('Code');
  geoGui.add(guiController, 'geoAngle',        0, 180)                 .name('Angle');
  geoGui.add(guiController, 'geoHeight',       1, 100/3)               .name('Height');
  geoGui.add(guiController, 'geoWidth',        1, 50/3)                .name('Width');
  geoGui.add(guiController, 'geoResolution',   20, 60)                 .name('Resolution');
  geoGui.add(guiController, 'geoMaterial',     Object.keys(materials)) .name('Material');

  geoGui.open();

  gui.add(guiController, 'render');
}

function onWindowResize() {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  renderer.setSize(canvasWidth, canvasHeight);

  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
}

function update() {
  forklift.update();
}

function render() {
  requestAnimationFrame(render);
  update();
  renderer.render(scene, camera);
}

/* ------------------ Cameras -----------------*/

function setSceneCamera() {
  baseCamera.position.set(-100, 100, 100);

  cameraControls.target.set(0, 40, 0);

  cameraControls.update();
  camera = baseCamera;
}

function setPrinterCamera() {
  baseCamera.position.set(-100, 100, 100);

  const target = new THREE.Vector3();
  printer.mesh.getWorldPosition(target);
  cameraControls.target.copy(target);

  cameraControls.update();
  camera = baseCamera;
}

function setShelvesCamera() {
  baseCamera.position.set(-100, 100, 100);

  const target = new THREE.Vector3();
  shelves.mesh.getWorldPosition(target);
  target.y += 50;
  target.z -= 90;
  cameraControls.target.copy(target);

  cameraControls.update();
  camera = baseCamera;
}

function createDriverCamera() {
  const camera = new THREE.PerspectiveCamera(90, initWindowRatio, 1, 550);
  camera.position.y = 25;
  camera.position.z = -10;
  camera.rotation.y = -Math.PI / 2;

  forklift.mesh.add(camera);
  return camera
}

function createBackCamera() {
  const camera = new THREE.PerspectiveCamera(90, initWindowRatio, 1, 550);
  camera.position.y = 60;
  camera.position.x = -70;
  camera.rotation.y = -Math.PI / 2;

  forklift.mesh.add(camera);
  return camera
}

function createSideCamera() {
  const camera = new THREE.PerspectiveCamera(90, initWindowRatio, 1, 550);
  camera.position.y = 60;
  camera.position.z = 75;

  forklift.mesh.add(camera);
  return camera
}
