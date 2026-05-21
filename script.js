import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;

const loader = new FBXLoader();

let mixer;

loader.load(
  "/characters/character_1/scene.fbx",

  (error) => {
    console.error("Error fbx:", error);
  },
);
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
