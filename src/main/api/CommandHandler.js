import { logger } from "../core/Logger";

/**
 * Command Handler for API Server
 * Translates external API commands into internal IPC messages
 * for controlling Live2D models
 */
export class CommandHandler {
  constructor(application) {
    this.application = application;
  }

  /**
   * Handle incoming API commands
   * @param {Object} command - Command object with action and data
   */
  handle(command) {
    const { action, data } = command;

    logger.info(`[Command Handler] Processing action: ${action}`);

    try {
      switch (action) {
        // Model parameter control
        case "setParameter":
          return this.setParameter(data);

        case "setParameters":
          return this.setParameters(data);

        // Model animation control
        case "playMotion":
          return this.playMotion(data);

        case "playRandomMotion":
          return this.playRandomMotion(data);

        case "stopMotion":
          return this.stopMotion();

        // Model expression/pose
        case "setExpression":
          return this.setExpression(data);

        // Model parts control
        case "setPart":
          return this.setPart(data);

        case "setParts":
          return this.setParts(data);

        // Eye and breathing control
        case "setAutoBreath":
          return this.setAutoBreath(data);

        case "setAutoEyeBlink":
          return this.setAutoEyeBlink(data);

        case "setTrackMouse":
          return this.setTrackMouse(data);

        // Focus control
        case "setFocus":
          return this.setFocus(data);

        // Model loading
        case "loadModel":
          return this.loadModel(data);

        // Window control
        case "showDisplay":
          return this.showDisplay();

        case "hideDisplay":
          return this.hideDisplay();

        // Query model info
        case "getModelInfo":
          return this.getModelInfo();

        // Source Engine MDL-specific commands
        case "playSequence":
          return this.playSequence(data);

        case "stopSequence":
          return this.stopSequence();

        case "setBodyGroup":
          return this.setBodyGroup(data);

        case "setSkin":
          return this.setSkin(data);

        case "setSequenceSpeed":
          return this.setSequenceSpeed(data);

        case "setSequenceLoop":
          return this.setSequenceLoop(data);

        default:
          logger.warn(`[Command Handler] Unknown action: ${action}`);
          return { success: false, error: "Unknown action" };
      }
    } catch (error) {
      logger.error(`[Command Handler] Error processing ${action}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set a single model parameter
   * @param {Object} data - { parameterId: string, value: number }
   */
  setParameter(data) {
    const { parameterId, value } = data;
    
    if (!parameterId || value === undefined) {
      throw new Error("parameterId and value are required");
    }

    this.sendToDisplay("control:set-parameter", { parameterId, value });
    return { success: true, action: "setParameter", parameterId, value };
  }

  /**
   * Set multiple model parameters at once
   * @param {Object} data - { parameters: [{ parameterId, value }, ...] }
   */
  setParameters(data) {
    const { parameters } = data;

    if (!Array.isArray(parameters)) {
      throw new Error("parameters must be an array");
    }

    parameters.forEach(({ parameterId, value }) => {
      this.sendToDisplay("control:set-parameter", { parameterId, value });
    });

    return { success: true, action: "setParameters", count: parameters.length };
  }

  /**
   * Play a motion animation
   * @param {Object} data - { group: string, index: number } or { group: string, file: string }
   */
  playMotion(data) {
    const { group, index, file, File } = data;

    if (!group) {
      throw new Error("group is required");
    }

    const motionInfo = { group };
    if (index !== undefined) {
      motionInfo.index = index;
    }
    if (file) {
      motionInfo.file = file;
    }
    if (File) {
      motionInfo.File = File;
    }

    this.sendToDisplay("control:play-motion", { motion: motionInfo });
    return { success: true, action: "playMotion", motion: motionInfo };
  }

  /**
   * Play a random motion from a group
   * @param {Object} data - { group: string } or null for any group
   */
  playRandomMotion(data = {}) {
    const { group } = data;
    
    // Send motion path as "random" which the manager handles
    this.sendToDisplay("control:play-motion", { 
      motion: { group: group || null, random: true } 
    });
    
    return { success: true, action: "playRandomMotion", group: group || "any" };
  }

  /**
   * Stop current motion
   */
  stopMotion() {
    this.sendToDisplay("control:play-motion", { 
      motion: { group: "none" } 
    });
    return { success: true, action: "stopMotion" };
  }

  /**
   * Set model expression (if supported)
   * @param {Object} data - { expression: string }
   */
  setExpression(data) {
    const { expression } = data;
    
    if (!expression) {
      throw new Error("expression is required");
    }

    // Expressions are typically handled as special motions or parameters
    // This is a placeholder - adjust based on your model's structure
    this.sendToDisplay("control:set-expression", { expression });
    return { success: true, action: "setExpression", expression };
  }

  /**
   * Set a model part opacity
   * @param {Object} data - { partId: string, value: number }
   */
  setPart(data) {
    const { partId, value } = data;

    if (!partId || value === undefined) {
      throw new Error("partId and value are required");
    }

    this.sendToDisplay("control:set-part", { partId, value });
    return { success: true, action: "setPart", partId, value };
  }

  /**
   * Set multiple model parts at once
   * @param {Object} data - { parts: [{ partId, value }, ...] }
   */
  setParts(data) {
    const { parts } = data;

    if (!Array.isArray(parts)) {
      throw new Error("parts must be an array");
    }

    parts.forEach(({ partId, value }) => {
      this.sendToDisplay("control:set-part", { partId, value });
    });

    return { success: true, action: "setParts", count: parts.length };
  }

  /**
   * Enable/disable automatic breathing
   * @param {Object} data - { enabled: boolean }
   */
  setAutoBreath(data) {
    const { enabled } = data;

    if (enabled === undefined) {
      throw new Error("enabled is required");
    }

    this.sendToDisplay("control:change-instant-config", {
      name: "autoBreath",
      value: enabled,
    });

    return { success: true, action: "setAutoBreath", enabled };
  }

  /**
   * Enable/disable automatic eye blinking
   * @param {Object} data - { enabled: boolean }
   */
  setAutoEyeBlink(data) {
    const { enabled } = data;

    if (enabled === undefined) {
      throw new Error("enabled is required");
    }

    this.sendToDisplay("control:change-instant-config", {
      name: "autoEyeBlink",
      value: enabled,
    });

    return { success: true, action: "setAutoEyeBlink", enabled };
  }

  /**
   * Enable/disable mouse tracking
   * @param {Object} data - { enabled: boolean }
   */
  setTrackMouse(data) {
    const { enabled } = data;

    if (enabled === undefined) {
      throw new Error("enabled is required");
    }

    this.sendToDisplay("control:change-instant-config", {
      name: "trackMouse",
      value: enabled,
    });

    return { success: true, action: "setTrackMouse", enabled };
  }

  /**
   * Set model focus/look direction
   * @param {Object} data - { x: number, y: number } (normalized -1 to 1)
   */
  setFocus(data) {
    const { x, y } = data;

    if (x === undefined || y === undefined) {
      throw new Error("x and y are required");
    }

    // This would require extending the Live2dManager to accept focus commands
    // For now, we can disable mouse tracking and set parameters manually
    this.sendToDisplay("control:set-focus", { x, y });
    
    return { success: true, action: "setFocus", x, y };
  }

  /**
   * Load a different model
   * @param {Object} data - Model info object
   */
  loadModel(data) {
    // This would require the model info structure from your database
    // The control window typically handles this
    this.application.windowManager.sendMessageToWindow(
      "control",
      "api:load-model",
      data
    );

    return { success: true, action: "loadModel", model: data };
  }

  /**
   * Show the display window
   */
  showDisplay() {
    if (this.application.windowManager.windows.display) {
      this.application.windowManager.windows.display.show();
    } else {
      this.application.openWindow(
        this.application.configDB.get(["display", "display-mode"]).value()
      );
    }
    return { success: true, action: "showDisplay" };
  }

  /**
   * Hide the display window
   */
  hideDisplay() {
    if (this.application.windowManager.windows.display) {
      this.application.windowManager.windows.display.hide();
    }
    return { success: true, action: "hideDisplay" };
  }

  /**
   * Get current model information
   */
  getModelInfo() {
    // This would need to query the display window for current model state
    // For now, return a placeholder
    return {
      success: true,
      action: "getModelInfo",
      message: "Query sent to display window",
    };
  }

  /**
   * Play an animation sequence (Source Engine MDL models)
   * @param {Object} data - { sequenceIndex: number } or { sequenceName: string }
   */
  playSequence(data) {
    const { sequenceIndex, sequenceName } = data;

    if (sequenceIndex === undefined && !sequenceName) {
      throw new Error("sequenceIndex or sequenceName is required");
    }

    this.sendToDisplay("control:play-sequence", { sequenceIndex, sequenceName });
    return { 
      success: true, 
      action: "playSequence", 
      sequenceIndex, 
      sequenceName 
    };
  }

  /**
   * Stop the current animation sequence (Source Engine MDL models)
   */
  stopSequence() {
    this.sendToDisplay("control:stop-sequence", {});
    return { success: true, action: "stopSequence" };
  }

  /**
   * Set a bodygroup value (Source Engine MDL models)
   * @param {Object} data - { bodyGroupIndex: number, value: number }
   */
  setBodyGroup(data) {
    const { bodyGroupIndex, value } = data;

    if (bodyGroupIndex === undefined || value === undefined) {
      throw new Error("bodyGroupIndex and value are required");
    }

    this.sendToDisplay("control:set-bodygroup", { bodyGroupIndex, value });
    return { success: true, action: "setBodyGroup", bodyGroupIndex, value };
  }

  /**
   * Set the model skin/texture variant (Source Engine MDL models)
   * @param {Object} data - { skinIndex: number }
   */
  setSkin(data) {
    const { skinIndex } = data;

    if (skinIndex === undefined) {
      throw new Error("skinIndex is required");
    }

    this.sendToDisplay("control:set-skin", { skinIndex });
    return { success: true, action: "setSkin", skinIndex };
  }

  /**
   * Set animation sequence playback speed (Source Engine MDL models)
   * @param {Object} data - { speed: number } (1.0 = normal speed)
   */
  setSequenceSpeed(data) {
    const { speed } = data;

    if (speed === undefined) {
      throw new Error("speed is required");
    }

    this.sendToDisplay("control:change-instant-config", {
      name: "animationSpeed",
      value: speed,
    });

    return { success: true, action: "setSequenceSpeed", speed };
  }

  /**
   * Set whether animation sequences should loop (Source Engine MDL models)
   * @param {Object} data - { loop: boolean }
   */
  setSequenceLoop(data) {
    const { loop } = data;

    if (loop === undefined) {
      throw new Error("loop is required");
    }

    this.sendToDisplay("control:change-instant-config", {
      name: "loopAnimation",
      value: loop,
    });

    return { success: true, action: "setSequenceLoop", loop };
  }

  /**
   * Send message to display window via IPC
   */
  sendToDisplay(channel, data) {
    const displayWindow = this.application.windowManager.windows.display;
    
    if (!displayWindow) {
      throw new Error("Display window is not open");
    }

    displayWindow.webContents.send("control2display:send-to-model-manager", {
      channel,
      data,
    });
  }
}
