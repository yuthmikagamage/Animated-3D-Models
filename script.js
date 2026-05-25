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

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

loader.load(
  "/characters/character_1/scene.fbx",
  (fbx) => {
    fbx.scale.setScalar(0.01);
    scene.add(fbx);

    console.log("Model loaded:", fbx);
  },
  undefined,
  (error) => {
    console.error("Error loading FBX:", error);
  },
);
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
