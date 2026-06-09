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
camera.position.set(0, 1.7, -1.5);
camera.lookAt(0, 0.6, 0.8);

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

const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.8,
  metalness: 0.2,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let idleAction = null;
let walkAction = null;
let punchAction = null;
let isPunching = false;
let isWalking = false;
let character = null;
let targetPosition = null;
const MOVE_DISTANCE = 1.5;
const MOVE_SPEED = 2.0;
let targetRotationY = 0;
let moveDirection = new THREE.Vector3();

loader.load(
  "/characters/character_1/scene.fbx",
  (fbx) => {
    fbx.scale.setScalar(1);
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(fbx);
    fbx.add(camera);
    character = fbx;

    mixer = new THREE.AnimationMixer(fbx);
    idleAction = mixer.clipAction(fbx.animations[3]);
    walkAction = mixer.clipAction(fbx.animations[1]);

    const originalPunchClip = fbx.animations[4];
    const clippedPunch = THREE.AnimationUtils.subclip(
      originalPunchClip,
      "punch_short",
      5,
      19,
    );
    punchAction = mixer.clipAction(clippedPunch);
    punchAction.setLoop(THREE.LoopOnce, 1);
    punchAction.clampWhenFinished = true;

    idleAction.play();

    mixer.addEventListener("finished", (e) => {
      if (e.action === punchAction) {
        isPunching = false;
        punchAction.fadeOut(0.2);
        idleAction.reset().fadeIn(0.2).play();
      }
    });
  },
  undefined,
  (error) => console.error("Error loading FBX:", error),
);

window.addEventListener("mousedown", (e) => {
  if (!character) return;

  if (e.button === 0) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(floor);

    if (hits.length > 0 && !isPunching) {
      const clickPoint = hits[0].point;
      const dir = new THREE.Vector3(
        clickPoint.x - character.position.x,
        0,
        clickPoint.z - character.position.z,
      ).normalize();

      moveDirection.copy(dir);
      targetRotationY = Math.atan2(dir.x, dir.z);

      targetPosition = new THREE.Vector3(
        character.position.x + dir.x * MOVE_DISTANCE,
        character.position.y,
        character.position.z + dir.z * MOVE_DISTANCE,
      );

      if (!isWalking) {
        isWalking = true;
        idleAction.fadeOut(0.2);
        walkAction.reset().fadeIn(0.2).play();
      }
    }
  } else if (e.button === 2 && !isPunching && idleAction && punchAction) {
    isPunching = true;
    isWalking = false;
    targetPosition = null;
    walkAction.fadeOut(0.2);
    punchAction.reset().fadeIn(0.2).play();
  }
});

window.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);
  if (character) {
    let angleDiff = targetRotationY - character.rotation.y;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    character.rotation.y += angleDiff * Math.min(1, 12 * delta);

    const isAligned = Math.abs(angleDiff) < 0.15;

    if (targetPosition && isWalking && isAligned) {
      const distLeft = new THREE.Vector3()
        .subVectors(targetPosition, character.position)
        .length();
      const step = MOVE_SPEED * delta;

      if (distLeft <= step) {
        character.position.copy(targetPosition);
        targetPosition = null;
        isWalking = false;
        walkAction.fadeOut(0.2);
        idleAction.reset().fadeIn(0.2).play();
      } else {
        character.position.addScaledVector(moveDirection, step);
      }
    }
  }

  renderer.render(scene, camera);
}
animate();
