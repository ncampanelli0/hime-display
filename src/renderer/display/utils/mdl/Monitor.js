/**
 * Monitor for tracking Source Engine model state changes
 */

/**
 * Sequence Monitor - tracks animation sequence changes
 */
export class SequenceMonitor {
  constructor() {
    this.sequenceIndex = null;
    this.time = 0;
    this.lastUpdate = {
      sequenceIndex: null,
      time: 0,
    };
  }

  /**
   * Update the current sequence state
   * @param {number} sequenceIndex - Current sequence index
   * @param {number} time - Current animation time
   */
  update(sequenceIndex, time) {
    this.sequenceIndex = sequenceIndex;
    this.time = time;
  }

  /**
   * Check if state has changed since last check
   * @returns {boolean} True if changed
   */
  checkUpdate() {
    if (
      this.sequenceIndex !== this.lastUpdate.sequenceIndex ||
      Math.abs(this.time - this.lastUpdate.time) > 0.05
    ) {
      this.lastUpdate.sequenceIndex = this.sequenceIndex;
      this.lastUpdate.time = this.time;
      return true;
    }
    return false;
  }

  /**
   * Get current state
   * @returns {Object} Current sequence state
   */
  getState() {
    return {
      sequenceIndex: this.sequenceIndex,
      time: this.time,
    };
  }

  /**
   * Reset monitor
   */
  reset() {
    this.sequenceIndex = null;
    this.time = 0;
    this.lastUpdate.sequenceIndex = null;
    this.lastUpdate.time = 0;
  }
}

/**
 * BodyGroup Monitor - tracks bodygroup changes
 */
export class BodyGroupMonitor {
  constructor() {
    this.bodyGroups = new Map();
    this.lastUpdate = new Map();
  }

  /**
   * Set a bodygroup value
   * @param {number} index - Bodygroup index
   * @param {number} value - Bodygroup value
   */
  set(index, value) {
    this.bodyGroups.set(index, value);
  }

  /**
   * Get a bodygroup value
   * @param {number} index - Bodygroup index
   * @returns {number|undefined} Bodygroup value
   */
  get(index) {
    return this.bodyGroups.get(index);
  }

  /**
   * Check if any bodygroups have changed
   * @returns {boolean} True if changed
   */
  checkUpdate() {
    let hasChanged = false;

    for (const [index, value] of this.bodyGroups) {
      if (this.lastUpdate.get(index) !== value) {
        this.lastUpdate.set(index, value);
        hasChanged = true;
      }
    }

    return hasChanged;
  }

  /**
   * Get all bodygroup states
   * @returns {Object} Bodygroup states
   */
  getState() {
    return Object.fromEntries(this.bodyGroups);
  }

  /**
   * Reset monitor
   */
  reset() {
    this.bodyGroups.clear();
    this.lastUpdate.clear();
  }
}

/**
 * Skin Monitor - tracks skin/texture changes
 */
export class SkinMonitor {
  constructor() {
    this.skinIndex = 0;
    this.lastUpdate = 0;
  }

  /**
   * Set current skin index
   * @param {number} index - Skin index
   */
  set(index) {
    this.skinIndex = index;
  }

  /**
   * Get current skin index
   * @returns {number} Skin index
   */
  get() {
    return this.skinIndex;
  }

  /**
   * Check if skin has changed
   * @returns {boolean} True if changed
   */
  checkUpdate() {
    if (this.skinIndex !== this.lastUpdate) {
      this.lastUpdate = this.skinIndex;
      return true;
    }
    return false;
  }

  /**
   * Get current state
   * @returns {number} Current skin index
   */
  getState() {
    return this.skinIndex;
  }

  /**
   * Reset monitor
   */
  reset() {
    this.skinIndex = 0;
    this.lastUpdate = 0;
  }
}
