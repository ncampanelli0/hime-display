import { ModelManager3D } from "./ModelManager3D";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import { MouseFocusHelper } from "@display/utils/3d/MouseFocusHelper.js";
import { buildNodeInfoTreeAndList } from "@display/utils/3d/NodeInfo";
import { TransformMonitor } from "@display/utils/3d/Monitor";

export class GltfManager extends ModelManager3D {
  constructor(parentApp) {
    super(parentApp);
    this._initObjects();
  }
  switchIn() {
    this.clock = new THREE.Clock();
    this.ModelLoader = new GLTFLoader();
    this.transformMonitor = new TransformMonitor();
    // scene
    this.scene = new THREE.Scene();
    this._addLight();
    //camera
    this.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0.0, 1.0, 5.0);
    this.scene.add(this.camera);
    //renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.antialias,
      aplpha: true,
      canvas: document.getElementById("display-canvas"),
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.resolution);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //effect
    this.effect = new OutlineEffect(this.renderer);
    this.effect.enabled = false; // Disable outline by default for generic GLTF
    this._initOrbitControls(); // Always enable orbit controls for GLTF models
    this._addEventListeners();
  }
  _addLight() {
    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, Math.PI);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(directionalLight);
  }
  loadModel(modelInfo) {
    return new Promise((resolve, reject) => {
      this._initInstantConfig();
      const modelFile = modelInfo.entranceFile;
      this.ModelLoader.load(
        modelFile,
        (gltf) => {
          console.log("[Hime Display] GLTF Loaded");
          this._clearModel();
          this.model = gltf.scene;
          
          // Center and scale the model
          const box = new THREE.Box3().setFromObject(this.model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          // Center the model
          this.model.position.x = -center.x;
          this.model.position.y = -center.y;
          this.model.position.z = -center.z;
          
          // Scale to reasonable size (max dimension = 2 units)
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim;
          this.model.scale.setScalar(scale);
          
          this.scene.add(this.model);
          if (!this.shouldRender) {
            this.shouldRender = true;
            this._render();
          }
          this._initMouseFocusHelper();
          resolve(this._buildModelControlInfo(modelInfo));
        },
        undefined,
        (error) => {
          console.error("[Hime Display] Error loading GLTF:", error);
          reject(error);
        }
      );
    });
  }
  _initInstantConfig() {
    const manager = this;
    this.instantConfig = {
      _trackMouse: false,
      get trackMouse() {
        return this._trackMouse;
      },
      set trackMouse(value) {
        this._trackMouse = value;
        if (!value && manager.mouseFocusHelper) {
          manager.mouseFocusHelper.object.rotation.set(0, 0, 0);
        }
      },
    };
  }
  _initMouseFocusHelper() {
    // Find a suitable object to track (try to find head or first mesh)
    let targetObject = null;
    this.model.traverse((child) => {
      if (!targetObject && child.isMesh) {
        targetObject = child;
      }
    });
    
    if (targetObject) {
      this.mouseFocusHelper = new MouseFocusHelper(targetObject, this.camera);
    }
  }
  _buildModelControlInfo(modelInfo) {
    const modelControlInfo = {
      description: [
        { label: "name", value: modelInfo.name },
        { label: "extension-name", value: modelInfo.extensionName },
        { label: "model-type", value: "GLTF" },
      ],
      morph: [],
      transform: buildNodeInfoTreeAndList(this.scene),
    };
    return modelControlInfo;
  }
  _updateObjects() {
    if (this.stats !== null) {
      this.stats.begin();
      this.stats.end();
    }
    if (this._sendToModelControl !== null) {
      if (this.transformMonitor.checkUpdate()) {
        this._sendToModelControl({
          channel: "manager:update-node-transform",
          data: this.transformMonitor.transform,
        });
      }
    }
    
    if (this.instantConfig?.trackMouse && this.mouseFocusHelper) {
      this.mouseFocusHelper.focus();
    }
  }
  handleMessage(message) {
    switch (message.channel) {
      case "control:bind-node-transform": {
        this._bindNodeTransform(message.data.nodeId);
        break;
      }
      case "control:set-node-transform": {
        this._setNodeTransform(message.data);
        break;
      }
      case "control:change-instant-config": {
        const { name, value } = message.data;
        this.instantConfig[name] = value;
        break;
      }
    }
  }
  _onPointerMove = (event) => {
    this.mouseFocusHelper?.update(event.clientX, event.clientY);
  };
}
