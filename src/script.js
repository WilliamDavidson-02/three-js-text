import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 400 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/8.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

// Group
const donutGroup = new THREE.Group();
scene.add(donutGroup);

// Fonts
let text;
const fontLoader = new FontLoader();
const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });

const textObj = {
  textContent: "Three.js",
};

const setTextContent = (input) => {
  fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
    const textGeometry = new TextGeometry(input, {
      font,
      size: 0.5,
      height: 0.2,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
    });

    textGeometry.center();

    text = new THREE.Mesh(textGeometry, material);
    scene.add(text);
  });
};

setTextContent(textObj.textContent);

let timer;

gui
  .add(textObj, "textContent")
  .onChange((value) => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      // Remove old text
      text.geometry.dispose();
      scene.remove(text);

      // Load new text
      setTextContent(value);
    }, 1000);
  })
  .onFinishChange((value) => {
    clearTimeout(timer);

    // Remove old text
    text.geometry.dispose();
    scene.remove(text);

    // Load new text
    setTextContent(value);
  });

const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);

for (let i = 0; i < 1000; i++) {
  const donut = new THREE.Mesh(donutGeometry, material);

  donut.position.x = (Math.random() - 0.5) * 20;
  donut.position.y = (Math.random() - 0.5) * 20;
  donut.position.z = (Math.random() - 0.5) * 20;

  donut.rotation.x = Math.random() * Math.PI;
  donut.rotation.y = Math.random() * Math.PI;

  const scale = Math.random();
  donut.scale.set(scale, scale, scale);

  donutGroup.add(donut);
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enabled = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// mouse
const mouse = { x: 0, y: 0 };

const setMousePos = (clientX, clientY) => {
  mouse.x = clientX / sizes.width - 0.5;
  mouse.y = clientY / sizes.height - 0.5;
};

window.addEventListener("mousemove", ({ clientX, clientY }) => {
  setMousePos(clientX, clientY);
});

window.addEventListener("touchmove", (ev) => {
  const { clientX, clientY } = ev.touches[0];
  setMousePos(clientX, clientY);
});

/**
 * Animate
 */

const tick = () => {
  // Update objects
  donutGroup.rotation.y = mouse.x * Math.PI * 0.35;
  donutGroup.rotation.x = mouse.y * Math.PI * 0.35;

  if (text) {
    text.rotation.y = mouse.x;
    text.rotation.x = -mouse.y;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
