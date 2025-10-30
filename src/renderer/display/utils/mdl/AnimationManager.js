import * as THREE from "three";

/**
 * Animation Manager for Source Engine models
 * Handles animation sequences, blending, and playback
 */
export class AnimationManager {
  constructor(mdlData) {
    this.mdlData = mdlData;
    this.sequences = mdlData.sequences || [];
    this.bones = mdlData.bones || [];
    
    this.currentSequence = null;
    this.currentTime = 0;
    this.animationSpeed = 1.0;
    this.isPlaying = false;
    this.loop = true;
    
    this.clock = new THREE.Clock();
    this.clock.stop();
  }

  /**
   * Play a sequence by index or name
   * @param {number|string} sequenceIdentifier - Sequence index or name
   * @returns {boolean} Success status
   */
  playSequence(sequenceIdentifier) {
    let sequence;
    
    if (typeof sequenceIdentifier === 'number') {
      sequence = this.sequences[sequenceIdentifier];
      this.currentSequence = sequenceIdentifier;
    } else if (typeof sequenceIdentifier === 'string') {
      const index = this.sequences.findIndex(
        seq => seq.name && seq.name.toLowerCase() === sequenceIdentifier.toLowerCase()
      );
      if (index >= 0) {
        sequence = this.sequences[index];
        this.currentSequence = index;
      }
    }

    if (!sequence) {
      console.warn(`[AnimationManager] Sequence not found: ${sequenceIdentifier}`);
      return false;
    }

    this.currentTime = 0;
    this.isPlaying = true;
    this.clock.start();
    
    console.log(`[AnimationManager] Playing sequence: ${sequence.name || this.currentSequence}`);
    return true;
  }

  /**
   * Stop the current animation
   */
  stop() {
    this.isPlaying = false;
    this.clock.stop();
    this.currentTime = 0;
  }

  /**
   * Pause the current animation
   */
  pause() {
    this.isPlaying = false;
    this.clock.stop();
  }

  /**
   * Resume the paused animation
   */
  resume() {
    if (this.currentSequence !== null) {
      this.isPlaying = true;
      this.clock.start();
    }
  }

  /**
   * Set animation loop mode
   * @param {boolean} loop - Whether to loop the animation
   */
  setLoop(loop) {
    this.loop = loop;
  }

  /**
   * Set animation playback speed
   * @param {number} speed - Speed multiplier (1.0 = normal)
   */
  setSpeed(speed) {
    this.animationSpeed = Math.max(0, speed);
  }

  /**
   * Update animation state
   * Should be called every frame
   * @param {THREE.Group} model - The Three.js model group
   */
  update(model) {
    if (!this.isPlaying || this.currentSequence === null) {
      return;
    }

    const sequence = this.sequences[this.currentSequence];
    if (!sequence) {
      return;
    }

    // Update time
    const delta = this.clock.getDelta();
    this.currentTime += delta * this.animationSpeed;

    // Get sequence duration (FPS-based)
    const fps = sequence.fps || 30;
    const frameCount = sequence.frameCount || 1;
    const duration = frameCount / fps;

    // Handle loop/end
    if (this.currentTime >= duration) {
      if (this.loop) {
        this.currentTime = this.currentTime % duration;
      } else {
        this.currentTime = duration;
        this.stop();
        return;
      }
    }

    // Apply animation to model
    this._applyAnimationToModel(model, sequence, this.currentTime);
  }

  /**
   * Apply animation transforms to the model
   * @param {THREE.Group} model - The Three.js model
   * @param {Object} sequence - Sequence data
   * @param {number} time - Current animation time
   */
  _applyAnimationToModel(model, sequence, time) {
    // Calculate current frame
    const fps = sequence.fps || 30;
    const currentFrame = Math.floor(time * fps);
    
    // TODO: Apply bone transformations based on animation data
    // This requires parsing the Source Engine animation format
    // which includes bone positions, rotations, and scales per frame
    
    // Placeholder: simple rotation for demonstration
    if (model && sequence.name && sequence.name.toLowerCase().includes('walk')) {
      // Example: rotate model slightly during walk animation
      model.rotation.y = Math.sin(time * 2) * 0.1;
    }
  }

  /**
   * Get current sequence information
   * @returns {Object|null} Current sequence data
   */
  getCurrentSequence() {
    if (this.currentSequence === null) {
      return null;
    }
    
    return {
      index: this.currentSequence,
      name: this.sequences[this.currentSequence]?.name,
      duration: this.getDuration(),
      currentTime: this.currentTime,
      isPlaying: this.isPlaying,
    };
  }

  /**
   * Get duration of current sequence
   * @returns {number} Duration in seconds
   */
  getDuration() {
    if (this.currentSequence === null) {
      return 0;
    }
    
    const sequence = this.sequences[this.currentSequence];
    if (!sequence) {
      return 0;
    }
    
    const fps = sequence.fps || 30;
    const frameCount = sequence.frameCount || 1;
    return frameCount / fps;
  }

  /**
   * Get list of all available sequences
   * @returns {Array} Array of sequence names
   */
  getSequenceList() {
    return this.sequences.map((seq, index) => ({
      index,
      name: seq.name || `Sequence ${index}`,
      frameCount: seq.frameCount || 0,
      fps: seq.fps || 30,
    }));
  }

  /**
   * Seek to specific time in current animation
   * @param {number} time - Time in seconds
   */
  seek(time) {
    if (this.currentSequence === null) {
      return;
    }
    
    const duration = this.getDuration();
    this.currentTime = Math.max(0, Math.min(time, duration));
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    this.sequences = null;
    this.bones = null;
    this.mdlData = null;
  }
}
