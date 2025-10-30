import { ModelManager3D } from "./ModelManager3D";
import * as THREE from "three";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import { MouseFocusHelper } from "@display/utils/3d/MouseFocusHelper.js";
import { buildNodeInfoTreeAndList } from "@display/utils/3d/NodeInfo";
import { TransformMonitor } from "@display/utils/3d/Monitor";
import { SourceMDL } from "source-mdl";

/**
 * Manager for Source Engine models (.mdl files from games like Left 4 Dead 2)
 * Handles loading, rendering, and animation of Source Engine models
 */
export class SourceEngineManager extends ModelManager3D {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "SourceEngine";
    this._initObjects();
  }

  switchIn() {
    this.transformMonitor = new TransformMonitor();
    
    // Scene setup
    this.scene = new THREE.Scene();
    this._addLight();

    // Camera setup - using similar settings to MmdManager
    this.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.set(0, 10, 70);
    this.scene.add(this.camera);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.antialias,
      alpha: true,
      canvas: document.getElementById("display-canvas"),
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.resolution);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Outline effect
    this.effect = new OutlineEffect(this.renderer);
    this.effect.enabled = this.config.display["mdl-outline-effect"] ?? true;

    // Orbit controls if enabled
    this.config.display["mdl-orbit-controls"] && this._initOrbitControls();

    this._addEventListeners();
  }

  _addLight() {
    // Using similar lighting setup to MMD manager
    const ambient = new THREE.AmbientLight(0xaaaaaa, 3);
    this.scene.add(ambient);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(-1, 1, 1).normalize();
    this.scene.add(directionalLight);
  }

  /**
   * Load a Source Engine model
   * @param {Object} modelInfo - Model information including entranceFile path
   * @returns {Promise} Resolves when model is loaded
   */
  async loadModel(modelInfo) {
    return new Promise(async (resolve, reject) => {
      try {
        this._initInstantConfig();
        console.log("[Hime Display] Loading Source Engine MDL file:", modelInfo.entranceFile);

        // Source Engine models require .mdl, .vtx, and .vvd files
        const modelPath = modelInfo.entranceFile;
        const basePath = modelPath.replace(/\.mdl$/i, "");

        // Load the required files
        const mdlBuffer = await this._loadFile(modelPath);
        const vtxBuffer = await this._loadFile(basePath + ".vtx");
        const vvdBuffer = await this._loadFile(basePath + ".vvd");

        // Parse with source-mdl
        const parser = new SourceMDL(mdlBuffer, vtxBuffer, vvdBuffer);
        this.mdlData = parser;

        // Convert to Three.js geometry and mesh
        this._clearModel();
        this.model = this._createThreeMesh(parser);
        
        // Store animation sequences
        this.sequences = parser.sequences || [];
        this.currentSequence = null;
        this.sequenceTime = 0;

        // Store bodygroups and skins
        this.bodyGroups = parser.bodyGroups || [];
        this.skins = parser.skins || [];
        this.currentSkin = 0;

        this.scene.add(this.model);

        if (!this.shouldRender) {
          this.shouldRender = true;
          this._render();
        }

        this._initMouseFocusHelper();
        resolve(this._buildModelControlInfo(modelInfo));

      } catch (error) {
        console.error("[Hime Display] Error loading Source Engine model:", error);
        reject(error);
      }
    });
  }

  /**
   * Load a file as ArrayBuffer
   * @param {string} filePath - Path to the file
   * @returns {Promise<ArrayBuffer>}
   */
  async _loadFile(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${filePath}`);
    }
    return await response.arrayBuffer();
  }

  /**
   * Create Three.js mesh from parsed MDL data
   * @param {SourceMDL} parser - Parsed MDL data
   * @returns {THREE.Group}
   */
  _createThreeMesh(parser) {
    const group = new THREE.Group();
    
    // Convert MDL mesh data to Three.js geometry
    if (parser.meshes && parser.meshes.length > 0) {
      parser.meshes.forEach((meshData, index) => {
        const geometry = new THREE.BufferGeometry();
        
        // Set vertices
        if (meshData.vertices && meshData.vertices.length > 0) {
          const vertices = new Float32Array(meshData.vertices);
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        }
        
        // Set normals
        if (meshData.normals && meshData.normals.length > 0) {
          const normals = new Float32Array(meshData.normals);
          geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        }
        
        // Set UVs
        if (meshData.uvs && meshData.uvs.length > 0) {
          const uvs = new Float32Array(meshData.uvs);
          geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        }
        
        // Set indices
        if (meshData.indices && meshData.indices.length > 0) {
          const indices = new Uint16Array(meshData.indices);
          geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        }

        // Create material
        const material = new THREE.MeshPhongMaterial({
          color: 0xcccccc,
          side: THREE.DoubleSide,
        });

        // Load texture if available
        if (meshData.texture) {
          const textureLoader = new THREE.TextureLoader();
          const texture = textureLoader.load(meshData.texture);
          material.map = texture;
          material.needsUpdate = true;
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `mdl_mesh_${index}`;
        group.add(mesh);
      });
    } else {
      // If no proper mesh data, create a placeholder
      console.warn("[Hime Display] No mesh data found in MDL, creating placeholder");
      const geometry = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshPhongMaterial({ color: 0xff6600 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "mdl_placeholder";
      group.add(mesh);
    }

    return group;
  }

  _initInstantConfig() {
    const manager = this;
    
    this.instantConfig = {
      _trackMouse: true,
      get trackMouse() {
        return this._trackMouse;
      },
      set trackMouse(value) {
        this._trackMouse = value;
        if (!value && manager.mouseFocusHelper) {
          manager.mouseFocusHelper.object.rotation.set(0, 0, 0);
        }
      },
      animationSpeed: 1.0,
      loopAnimation: true,
    };
  }

  _initMouseFocusHelper() {
    // Try to find a head bone or use the root
    let targetBone = this.model;
    
    // Source Engine models typically have bones, try to find head
    if (this.model.children.length > 0) {
      const headBone = this.model.children.find(
        child => child.name && child.name.toLowerCase().includes('head')
      );
      targetBone = headBone || this.model;
    }

    this.mouseFocusHelper = new MouseFocusHelper(targetBone, this.camera);
  }

  _buildModelControlInfo(modelInfo) {
    const modelControlInfo = {
      description: [
        { label: "name", value: modelInfo.name },
        { label: "extension-name", value: modelInfo.extensionName },
        { label: "model-type", value: "Source Engine MDL" },
        { label: "sequences", value: this.sequences.length },
        { label: "bodygroups", value: this.bodyGroups.length },
        { label: "skins", value: this.skins.length },
      ],
      sequences: this.sequences.map((seq, idx) => seq.name || `Sequence ${idx}`),
      bodygroups: this.bodyGroups.map((bg, idx) => bg.name || `BodyGroup ${idx}`),
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

    // Update animation
    if (this.currentSequence !== null && this.clock) {
      const delta = this.clock.getDelta();
      this.sequenceTime += delta * this.instantConfig.animationSpeed;
      
      const sequence = this.sequences[this.currentSequence];
      if (sequence && sequence.duration) {
        if (this.sequenceTime >= sequence.duration) {
          if (this.instantConfig.loopAnimation) {
            this.sequenceTime = 0;
          } else {
            this.sequenceTime = sequence.duration;
          }
        }
        
        // Apply animation frame (placeholder for actual implementation)
        this._applyAnimationFrame(sequence, this.sequenceTime);
      }
    }

    // Mouse tracking
    if (
      this.instantConfig?.trackMouse &&
      this.currentSequence === null &&
      this.mouseFocusHelper
    ) {
      this.mouseFocusHelper.focus();
    }
  }

  /**
   * Apply animation frame to model (placeholder for actual bone animation)
   * @param {Object} sequence - Animation sequence data
   * @param {number} time - Current animation time
   */
  _applyAnimationFrame(sequence, time) {
    // TODO: Implement actual bone animation based on sequence data
    // This would require parsing bone hierarchies and applying transforms
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
      case "control:play-sequence": {
        const { sequenceIndex, sequenceName } = message.data;
        this._playSequence(sequenceIndex, sequenceName);
        break;
      }
      case "control:stop-sequence": {
        this._stopSequence();
        break;
      }
      case "control:set-bodygroup": {
        const { bodyGroupIndex, value } = message.data;
        this._setBodyGroup(bodyGroupIndex, value);
        break;
      }
      case "control:set-skin": {
        const { skinIndex } = message.data;
        this._setSkin(skinIndex);
        break;
      }
      case "control:change-instant-config": {
        const { name, value } = message.data;
        this.instantConfig[name] = value;
        break;
      }
    }
  }

  /**
   * Play an animation sequence
   * @param {number} sequenceIndex - Index of the sequence
   * @param {string} sequenceName - Name of the sequence (alternative to index)
   */
  _playSequence(sequenceIndex, sequenceName) {
    if (sequenceName) {
      sequenceIndex = this.sequences.findIndex(
        seq => seq.name === sequenceName
      );
    }

    if (sequenceIndex >= 0 && sequenceIndex < this.sequences.length) {
      this.currentSequence = sequenceIndex;
      this.sequenceTime = 0;
      
      if (!this.clock) {
        this.clock = new THREE.Clock();
      }
      
      console.log(`[Hime Display] Playing sequence: ${this.sequences[sequenceIndex].name || sequenceIndex}`);
      
      if (this._sendToModelControl) {
        this._sendToModelControl({
          channel: "manager:sequence-started",
          data: {
            sequenceIndex,
            sequenceName: this.sequences[sequenceIndex].name,
          },
        });
      }
    } else {
      console.warn(`[Hime Display] Invalid sequence index: ${sequenceIndex}`);
    }
  }

  /**
   * Stop the current animation sequence
   */
  _stopSequence() {
    this.currentSequence = null;
    this.sequenceTime = 0;
    console.log("[Hime Display] Sequence stopped");
  }

  /**
   * Set a bodygroup value
   * @param {number} bodyGroupIndex - Index of the bodygroup
   * @param {number} value - Value to set
   */
  _setBodyGroup(bodyGroupIndex, value) {
    if (bodyGroupIndex >= 0 && bodyGroupIndex < this.bodyGroups.length) {
      // TODO: Implement actual bodygroup switching
      console.log(`[Hime Display] Set bodygroup ${bodyGroupIndex} to ${value}`);
      
      if (this._sendToModelControl) {
        this._sendToModelControl({
          channel: "manager:bodygroup-changed",
          data: { bodyGroupIndex, value },
        });
      }
    }
  }

  /**
   * Set the skin/texture variant
   * @param {number} skinIndex - Index of the skin
   */
  _setSkin(skinIndex) {
    if (skinIndex >= 0 && skinIndex < this.skins.length) {
      this.currentSkin = skinIndex;
      // TODO: Implement actual skin switching on the model
      console.log(`[Hime Display] Set skin to ${skinIndex}`);
      
      if (this._sendToModelControl) {
        this._sendToModelControl({
          channel: "manager:skin-changed",
          data: { skinIndex },
        });
      }
    }
  }

  _onPointerMove = (event) => {
    this.mouseFocusHelper?.update(event.clientX, event.clientY);
  };
}
