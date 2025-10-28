# Supported Model Formats

This document outlines all the 3D and 2D model formats supported by Hime Display.

## 3D Model Formats

### VRM Models (.vrm)
- **Description**: VRM is a file format for handling 3D humanoid avatar data, primarily used for VTuber applications
- **Loader**: GLTFLoader with VRMLoaderPlugin
- **Manager**: VroidManager
- **Features**:
  - Full humanoid rigging support
  - Expression/morph target control
  - Physics simulation
  - Mouse tracking (head follows cursor)
  - Face mesh and holistic motion capture support
  - VRM metadata (author, usage rights, etc.)

### MMD Models (.pmx, .pmd)
- **Description**: MikuMikuDance model formats
- **Loader**: MMDLoader
- **Manager**: MmdManager
- **Features**:
  - Bone and IK system support
  - Morph targets (facial expressions, etc.)
  - Physics simulation (hair, clothing, etc.)
  - Motion (.vmd) file playback
  - Audio synchronization
  - Mouse tracking (head follows cursor)
  - Face mesh and holistic motion capture support

### glTF/GLB Models (.gltf, .glb)
- **Description**: GL Transmission Format - industry standard 3D model format
- **Loader**: GLTFLoader
- **Manager**: VroidManager (compatible with glTF workflow)
- **Formats**:
  - `.gltf` - JSON-based format with external assets
  - `.glb` - Binary format with embedded assets
- **Features**:
  - PBR materials
  - Animations
  - Morph targets
  - Standard Three.js rendering pipeline

## 2D Model Formats

### Live2D Models
- **Description**: 2D animation format for creating animated characters
- **Manager**: Live2dManager
- **Features**:
  - Cubism SDK integration
  - Motion and expression support

### Spine Models
- **Description**: 2D skeletal animation format
- **Managers**: 
  - SpineManager
  - SpineManager42 (Spine 4.2 support)
- **Features**:
  - Skeletal animation system
  - Skin and attachment support

## Unsupported Formats

The following formats are **NOT** currently supported:
- **FBX** (.fbx) - Autodesk Filmbox format
- **USDZ** (.usdz) - Universal Scene Description format
- **OBJ** (.obj) - Wavefront OBJ format
- **DAE** (.dae) - COLLADA format

## Additional File Support

### Animation Files
- **VMD** (.vmd) - MikuMikuDance motion data files (for MMD models)

### Audio Files
- Motion playback with audio synchronization is supported for MMD models

## Recommendations

- **For VTuber/Avatar applications**: Use VRM format (.vrm)
- **For MikuMikuDance content**: Use PMX/PMD format (.pmx, .pmd)
- **For general 3D models**: Use glTF/GLB format (.gltf, .glb)
- **For 2D animated characters**: Use Live2D or Spine formats

## Technical Details

All 3D models are rendered using Three.js with the following features:
- Outline effects
- Orbit controls (optional)
- Mouse focus tracking
- Motion capture support (MediaPipe integration)
- Transform and morph controls
- Real-time physics simulation
