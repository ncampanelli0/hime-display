# Hime Display MCP Server for LM Studio

This directory contains the Model Context Protocol (MCP) server configuration for integrating Hime Display with LM Studio and other MCP-compatible AI clients.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that enables AI assistants to securely connect to external tools and data sources. This MCP server allows AI models in LM Studio to control your Live2D character in real-time.

## Features

- 🎭 **Emotion Control** - Set character emotions (happy, sad, surprised, angry, etc.)
- 🎬 **Animation Playback** - Play animations from different groups
- 👀 **Gaze Control** - Make the character look in specific directions
- 💬 **Speaking Animation** - Animate mouth movements for speech
- 🎨 **Parameter Control** - Fine-tune individual Live2D parameters
- 🪟 **Window Management** - Show/hide the display window
- 🤖 **Auto Features** - Control breathing, blinking, and mouse tracking

## Installation

### Prerequisites

1. **Hime Display** must be installed and running
2. **Python 3.8+** is required
3. **LM Studio** must be installed

### Step 1: Install Python Dependencies

```powershell
pip install mcp websockets aiohttp
```

### Step 2: Configure Hime Display API

Make sure the API is enabled in Hime Display settings. Default configuration:
- WebSocket Port: `8765`
- HTTP Port: `8766`

### Step 3: Configure LM Studio

1. Open LM Studio
2. Go to **Settings** → **Integrations** → **MCP Servers**
3. Click **Add Server**
4. Choose **Custom Server**
5. Use one of the configuration methods below:

#### Option A: Direct Python Script (Recommended)

Add this configuration to your LM Studio MCP servers:

```json
{
  "hime-display": {
    "command": "python",
    "args": ["E:\\programmingfiles\\javascript\\himedisplay\\hime-display\\mcp\\server.py"],
    "env": {}
  }
}
```

**Note:** Update the path to match your actual installation directory.

#### Option B: Using Node.js Wrapper

If you prefer Node.js:

```json
{
  "hime-display": {
    "command": "node",
    "args": ["E:\\programmingfiles\\javascript\\himedisplay\\hime-display\\mcp\\server.js"],
    "env": {}
  }
}
```

### Step 4: Start the Server

The server will automatically start when LM Studio connects to it. Make sure:

1. ✅ Hime Display is running
2. ✅ A Live2D model is loaded
3. ✅ API is enabled in settings

## Configuration

### Custom Ports

If you've changed the default ports in Hime Display, update them in the server configuration files:

**In `server.py`:**
```python
HIME_DISPLAY_WS = "ws://localhost:8765"    # Your WebSocket port
HIME_DISPLAY_HTTP = "http://localhost:8766" # Your HTTP port
```

**In `server.js`:**
```javascript
const HIME_DISPLAY_WS = "ws://localhost:8765";    // Your WebSocket port
const HIME_DISPLAY_HTTP = "http://localhost:8766"; // Your HTTP port
```

## Usage in LM Studio

Once configured, you can ask the AI in LM Studio to control your character:

**Example prompts:**

- "Make the character look happy"
- "Play an idle animation"
- "Make the character look to the left"
- "Show the display window"
- "Make the character speak for 2 seconds"
- "Set the character to look surprised"
- "Turn off mouse tracking"

The AI will automatically use the available MCP tools to control the Live2D model.

## Available Tools

The MCP server exposes these tools to the AI:

### 1. `set_emotion`
Set the character's emotion.
- **Parameters:** emotion (happy, sad, surprised, angry, confused, neutral)

### 2. `play_animation`
Play an animation from a specific group.
- **Parameters:** group (string), random (boolean)

### 3. `set_parameter`
Set a specific Live2D parameter.
- **Parameters:** parameter_id (string), value (number)

### 4. `speak`
Animate speaking for a duration.
- **Parameters:** duration (seconds), intensity (0.0-1.0)

### 5. `look_at`
Make the character look in a direction.
- **Parameters:** x (-1.0 to 1.0), y (-1.0 to 1.0)

### 6. `control_auto_features`
Enable/disable automatic features.
- **Parameters:** breath (bool), eye_blink (bool), track_mouse (bool)

### 7. `window_control`
Show or hide the display window.
- **Parameters:** action (show/hide)

## Troubleshooting

### Server Won't Start

**Error:** `Failed to connect to Hime Display`

**Solutions:**
- Ensure Hime Display is running
- Check that API is enabled in settings
- Verify the ports match your configuration
- Check firewall settings

### LM Studio Can't Find Server

**Error:** `MCP server not responding`

**Solutions:**
- Verify Python is in your PATH
- Check the file paths in your LM Studio configuration
- Try running the server manually: `python server.py`
- Check LM Studio logs for detailed error messages

### Commands Not Working

**Error:** Commands accepted but nothing happens

**Solutions:**
- Ensure a model is loaded in Hime Display
- Check that the display window is shown
- Verify parameter names match your model's parameters
- Check Hime Display logs for errors

### Port Already in Use

**Error:** `Address already in use`

**Solutions:**
- Close other instances of the server
- Change ports in both Hime Display and server configuration
- Check for other applications using ports 8765/8766

## Advanced Usage

### Creating Custom Emotions

You can extend the `set_emotion` tool with custom emotion presets by editing `server.py`:

```python
emotions = {
    "custom_emotion": [
        {"parameterId": "ParamMouthForm", "value": 0.5},
        {"parameterId": "ParamAngleX", "value": 15},
        # Add more parameters
    ]
}
```

### Chaining Commands

The AI can chain multiple commands for complex behaviors:

```
"Make the character look surprised, then play a greeting animation, and look at the camera"
```

### Integration with TTS

Combine with text-to-speech for a complete AI VTuber:

1. Use LM Studio's TTS capabilities
2. When the AI speaks, it automatically triggers `speak` tool
3. The character's mouth animates in sync

## Example Conversation

```
User: Show the character and make it happy

AI: [Uses window_control to show display]
    [Uses set_emotion with "happy"]
    I've shown the display window and set the character to a happy emotion!

User: Make it wave hello

AI: [Uses play_animation with group "greeting"]
    The character is now waving hello!
```

## Development

### Testing the Server

Run the server directly to test:

```powershell
# Python version
python server.py

# Node.js version
node server.js
```

### Debugging

Enable debug mode in `server.py`:

```python
# Add at the top
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Extending Tools

Add new tools by modifying the `list_tools()` and `call_tool()` functions in the server files.

## 🤖 Neuro-sama Style Auto-Animation

Want your character to automatically animate like Neuro-sama based on AI responses? Check out the **Auto-Animation Bridge**!

### Features
- ✨ **Automatic emotion detection** from AI text
- 💬 **Auto lip-sync** with speaking animations
- 🎭 **Reactive animations** based on context
- 😊 **Idle behaviors** for natural movement
- 🎯 **Real-time response** to AI generation

### Quick Start

**Option 1: Direct Chat with Auto-Animation**

```powershell
cd mcp
python lmstudio_integration.py
```

This creates an interactive chat session where:
- You type messages
- AI responds through LM Studio
- Character automatically animates with emotions, speaking, and reactions

**Option 2: Test Auto-Animation Only**

```powershell
python auto_animation_bridge.py
```

Runs test scenarios to show the animation system.

### How It Works

The auto-animation bridge:
1. **Analyzes AI responses** for emotional content
2. **Sets appropriate emotions** (happy, sad, surprised, etc.)
3. **Calculates speaking duration** based on text length
4. **Animates mouth movements** in sync
5. **Plays reactive motions** for strong emotions
6. **Maintains idle behaviors** when not speaking

### Example

```
[You] Tell me a joke!
[AI] Why did the AI cross the road? To optimize the path! Haha!

→ Emotion: happy
→ Animation: motion
→ Speaking: 2.3s
```

**Full Guide:** See [NEURO_SAMA_GUIDE.md](./NEURO_SAMA_GUIDE.md) for complete setup and customization.

## Resources

- [Hime Display API Documentation](../docs/API.md)
- [Neuro-sama Style Guide](./NEURO_SAMA_GUIDE.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [LM Studio Documentation](https://lmstudio.ai/docs)

## Support

For issues or questions:
- Check the [troubleshooting guide](#troubleshooting)
- Review Hime Display logs
- Open an issue on the GitHub repository

## License

This MCP server is part of Hime Display and follows the same GPL-3.0 license.
