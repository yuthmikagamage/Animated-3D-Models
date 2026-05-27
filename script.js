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
camera.position.set(0, 0.5, 2);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;

const loader = new FBXLoader();

let mixer;

const clock = new THREE.Clock();

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

loader.load(
  "/characters/character_1/scene.fbx",
  (fbx) => {
    fbx.scale.setScalar(1);
    scene.add(fbx);

    console.log("Model loaded:", fbx);

    mixer = new THREE.AnimationMixer(fbx);

    if (fbx.animations.length > 0) {
      const action = mixer.clipAction(fbx.animations[0]);
      action.play();
    }
  },
  undefined,
  (error) => {
    console.error("Error loading FBX:", error);
  },
);

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(clock.getDelta());
  }

  renderer.render(scene, camera);
}

animate();
