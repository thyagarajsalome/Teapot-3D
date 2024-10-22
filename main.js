import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Define color options
const teapotColors = [
  { color: "#8b0000", name: "dark red" },
  { color: "#683434", name: "brown" },
  { color: "#1a5e1a", name: "green" },
  { color: "#659994", name: "blue" },
  { color: "#896599", name: "mauve" },
  { color: "#ffa500", name: "orange" },
  { color: "#59555b", name: "grey" },
  { color: "#222222", name: "black" },
  { color: "#ececec", name: "white" },
  { color: "#800080", name: "purple" },
  { color: "#ffd700", name: "gold" },
  { color: "#c0c0c0", name: "silver" },
  { color: "#40826d", name: "teal" },
  { color: "#ff1493", name: "pink" },
  { color: "#4b0082", name: "indigo" },
  { color: "#8b4513", name: "saddle brown" },
  { color: "#daa520", name: "goldenrod" },
  { color: "#48d1cc", name: "turquoise" },
  { color: "#ff4500", name: "coral" },
  { color: "#9400d3", name: "violet" },
];

class TeapotViewer {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      25,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );

    this.setupRenderer();
    this.setupLights();
    this.setupControls();
    this.setupColorPicker();
    this.loadModel();
    this.addEventListeners();

    this.animate();
  }

  setupRenderer() {
    const canvas = document.getElementById("canvas");
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMappingExposure = 1.0;
    this.scene.background = new THREE.Color("#1E1E1E");
  }

  setupLights() {
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/metro_noord_1k.hdr",
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
        this.renderer.toneMappingExposure = 0.8;
      }
    );

    const lights = [
      {
        type: "directional",
        intensity: 1.5,
        position: [5, 5, 2],
        color: 0xffffff,
      },
      {
        type: "directional",
        intensity: 0.7,
        position: [-5, 3, 2],
        color: 0xe6e6ff,
      },
      {
        type: "directional",
        intensity: 1.2,
        position: [0, 5, -5],
        color: 0xffffff,
      },
      {
        type: "ambient",
        intensity: 1,
        color: 0xffffff,
      },
    ];

    lights.forEach((light) => {
      const newLight =
        light.type === "directional"
          ? new THREE.DirectionalLight(light.color, light.intensity)
          : new THREE.AmbientLight(light.color, light.intensity);

      if (light.position) {
        newLight.position.set(...light.position);
      }

      this.scene.add(newLight);
    });
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 5;
  }

  setupColorPicker() {
    // Create color picker container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.bottom = "20px";
    container.style.left = "20px";
    container.style.padding = "15px";

    // Add title
    const title = document.createElement("div");
    title.textContent = "Teapot Color";
    title.style.marginBottom = "10px";
    title.style.fontWeight = "bold";
    container.appendChild(title);

    // Create color buttons container
    const colorContainer = document.createElement("div");
    colorContainer.style.display = "flex";
    colorContainer.style.gap = "8px";
    colorContainer.style.flexWrap = "wrap";
    colorContainer.style.maxWidth = "200px";

    // Add color buttons
    teapotColors.forEach((colorOption) => {
      const colorButton = document.createElement("button");
      colorButton.style.width = "30px";
      colorButton.style.height = "30px";
      colorButton.style.borderRadius = "50%";
      colorButton.style.backgroundColor = colorOption.color;
      colorButton.style.border = "2px solid transparent";
      colorButton.style.cursor = "pointer";
      colorButton.title = colorOption.name;

      colorButton.addEventListener("click", () => {
        this.updateTeapotMaterial(colorOption.color);
        // Update selected button style
        document.querySelectorAll(".color-button").forEach((btn) => {
          btn.style.border = "2px solid transparent";
        });
        colorButton.style.border = "2px solid black";
      });

      colorButton.classList.add("color-button");
      colorContainer.appendChild(colorButton);
    });

    container.appendChild(colorContainer);

    // Add material controls
    const materialsContainer = document.createElement("div");
    materialsContainer.style.marginTop = "15px";

    // Metalness slider
    const metalnessContainer = document.createElement("div");
    metalnessContainer.style.marginBottom = "10px";

    const metalnessLabel = document.createElement("label");
    metalnessLabel.textContent = "Metalness: ";
    const metalnessValue = document.createElement("span");
    metalnessValue.textContent = "0.4";

    const metalnessSlider = document.createElement("input");
    metalnessSlider.type = "range";
    metalnessSlider.min = "0";
    metalnessSlider.max = "1";
    metalnessSlider.step = "0.1";
    metalnessSlider.value = "0.4";
    metalnessSlider.style.width = "100%";

    metalnessSlider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      metalnessValue.textContent = value.toFixed(1);
      if (this.teapotMesh) {
        this.teapotMesh.material.metalness = value;
      }
    });

    metalnessContainer.appendChild(metalnessLabel);
    metalnessContainer.appendChild(metalnessValue);
    metalnessContainer.appendChild(metalnessSlider);

    // Roughness slider
    const roughnessContainer = document.createElement("div");

    const roughnessLabel = document.createElement("label");
    roughnessLabel.textContent = "Roughness: ";
    const roughnessValue = document.createElement("span");
    roughnessValue.textContent = "0.2";

    const roughnessSlider = document.createElement("input");
    roughnessSlider.type = "range";
    roughnessSlider.min = "0";
    roughnessSlider.max = "1";
    roughnessSlider.step = "0.1";
    roughnessSlider.value = "0.2";
    roughnessSlider.style.width = "100%";

    roughnessSlider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      roughnessValue.textContent = value.toFixed(1);
      if (this.teapotMesh) {
        this.teapotMesh.material.roughness = value;
      }
    });

    roughnessContainer.appendChild(roughnessLabel);
    roughnessContainer.appendChild(roughnessValue);
    roughnessContainer.appendChild(roughnessSlider);

    materialsContainer.appendChild(metalnessContainer);
    materialsContainer.appendChild(roughnessContainer);
    container.appendChild(materialsContainer);

    document.body.appendChild(container);
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load("./teapot.glb", (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if (child.isMesh) {
          this.teapotMesh = child;
          this.updateTeapotMaterial(teapotColors[0].color);
        }
      });
      this.scene.add(model);
      this.centerCamera(model);
    });
  }

  updateTeapotMaterial(color) {
    if (this.teapotMesh) {
      this.teapotMesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.1,
        metalness: 0.4,
      });
    }
  }

  centerCamera(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = maxDim / Math.tan(fov / 2);

    this.camera.position.set(0, 0, cameraDistance * 1.5);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  addEventListeners() {
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the viewer
new TeapotViewer();
