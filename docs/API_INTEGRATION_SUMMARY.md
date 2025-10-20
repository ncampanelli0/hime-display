# API Integration Summary

## What Was Added

A complete API system for external control of Hime Display's Live2D models, perfect for AI-driven character systems like Neuro-sama.

## New Files Created

### Core API Files
- `src/main/api/ApiServer.js` - WebSocket and HTTP server implementation
- `src/main/api/CommandHandler.js` - Command processing and model control

### Documentation
- `docs/API.md` - Complete API reference with all commands and parameters
- `docs/API_QUICKSTART.md` - Quick start guide (5-minute setup)
- `docs/API_CONFIGURATION.md` - Configuration and deployment guide

### Examples
- `examples/python_client.py` - Full-featured Python WebSocket client
- `examples/node_client.js` - Full-featured Node.js WebSocket client
- `examples/mcp_server/mcp_server.py` - MCP server for Claude Desktop integration
- `examples/package.json` - Dependencies for Node.js examples
- `examples/README.md` - Example usage documentation

## Modified Files

### src/main/Application.js
- Added API server initialization
- Integrated command handler
- Added cleanup on app quit

### package.json
- Added `ws` (WebSocket) dependency

### README.md
- Added API integration announcement with links

## How It Works

```
AI/MCP Server → JSON Commands → WebSocket/HTTP → API Server → Command Handler → IPC → Live2D Manager → Model
```

1. **API Server** listens on two ports:
   - WebSocket (8765) for real-time bidirectional communication
   - HTTP (8766) for simple REST API calls

2. **Command Handler** translates JSON commands into internal IPC messages

3. **IPC Bridge** sends commands to the Live2D display window

4. **Live2D Manager** applies the commands to the model

## Supported Operations

### Model Control
- Set individual or multiple parameters (head rotation, eye movement, mouth, etc.)
- Play specific or random animations
- Control model parts opacity

### Automatic Features
- Enable/disable automatic breathing
- Enable/disable automatic eye blinking
- Enable/disable mouse tracking

### Window Management
- Show/hide display window

### Advanced
- Direct parameter access for full control
- Focus/look direction control
- Motion playback from groups

## Example Use Cases

### 1. AI VTuber (Neuro-sama Style)
```python
# Take control
await client.set_auto_breath(False)
await client.set_auto_eye_blink(False)

# React to AI emotion
if ai_state == "happy":
    await client.set_emotion("happy")
    await client.play_random_motion("joy")

# Sync with speech
await client.speak_animation(duration=audio_duration)
```

### 2. MCP Integration
```python
# Create MCP tools for Claude
@server.call_tool()
async def set_emotion(emotion):
    requests.post("http://localhost:8766", json={
        "action": "setEmotion",
        "data": {"emotion": emotion}
    })
```

### 3. Chat Integration
```javascript
// React to chat messages
chatClient.on('message', async (msg) => {
  if (msg.includes('!wave')) {
    client.playMotion('greeting', 0);
  }
  if (msg.includes('!smile')) {
    client.setEmotion('happy');
  }
});
```

## Key Features

✅ **Dual Protocol Support** - WebSocket for real-time, HTTP for simplicity
✅ **No Dependency on Control Panel** - Direct model control via API
✅ **Bidirectional Communication** - WebSocket clients receive feedback
✅ **Easy Integration** - Simple JSON commands
✅ **Full Parameter Control** - Access to all Live2D parameters
✅ **Motion System** - Play animations by group or file
✅ **Example Implementations** - Python, Node.js, and MCP server
✅ **Comprehensive Documentation** - Quick start, full reference, configuration

## Quick Start

1. **Start Hime Display**
   ```bash
   npm start
   ```

2. **Run Example**
   ```bash
   # Python
   pip install websockets
   python examples/python_client.py
   
   # Node.js
   cd examples
   npm install
   node node_client.js
   ```

3. **Send Your First Command**
   ```bash
   curl -X POST http://localhost:8766 \
     -H "Content-Type: application/json" \
     -d '{"action":"setEmotion","data":{"emotion":"happy"}}'
   ```

## Configuration

Default configuration (auto-created):
```json
{
  "api": {
    "enabled": true,
    "wsPort": 8765,
    "httpPort": 8766
  }
}
```

## Security Notes

⚠️ **Current Implementation:**
- No authentication
- Binds to all interfaces
- Suitable for local development

🔒 **For Production:**
- Use reverse proxy with auth
- Implement rate limiting
- Use WSS/HTTPS
- Consider VPN or whitelist

## Testing

```bash
# Health check
curl http://localhost:8766/health

# WebSocket connection
# (use websocat or the provided examples)

# Test emotion change
curl -X POST http://localhost:8766 \
  -H "Content-Type: application/json" \
  -d '{"action":"setEmotion","data":{"emotion":"happy"}}'
```

## Next Steps for Users

1. Read the [Quick Start Guide](./docs/API_QUICKSTART.md)
2. Try the [Example Clients](./examples/)
3. Check the [Full API Reference](./docs/API.md)
4. Integrate with your AI system!

## Future Enhancements (Optional)

Potential improvements you could add:
- Authentication system (API keys, OAuth)
- Rate limiting
- GUI configuration in control panel
- WebSocket message queuing
- State synchronization
- Event subscriptions (model state changes)
- Recording/playback of command sequences
- REST endpoints for all WebSocket commands
- Voice activity detection integration
- Facial expression presets management

## Technical Details

- **Language:** JavaScript (Node.js/Electron)
- **WebSocket Library:** ws ^8.18.0
- **HTTP:** Built-in Node.js http module
- **IPC:** Electron IPC (ipcMain/ipcRenderer)
- **Model Control:** pixi-live2d-display library

## Credits

Integration built for the Hime Display project to enable AI-driven character control, inspired by projects like Neuro-sama.

## License

Follows the same GPL-3.0 license as Hime Display.
