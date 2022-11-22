import * as THREE from './libs/three/three.module.js';

export const textureLoader = new THREE.TextureLoader()
  .setPath('textures/')
  ;

export const cubeTextureLoader = new THREE.CubeTextureLoader()
  .setPath('textures/')
  ;

export function tiled(texture, repeat) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}
