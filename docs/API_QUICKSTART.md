# API Integration Quick Start

## What is this?

This API allows you to control Hime Display's Live2D models programmatically via JSON messages - perfect for creating AI-driven characters like Neuro-sama! The camera input you mentioned handles facial tracking, while this API lets your AI directly control emotions, animations, and movements.

## Architecture

```
Your AI/MCP Server  →  WebSocket/HTTP  →  Hime Display API  →  Live2D Model
                         (JSON commands)
```

## Quick Start (5 minutes)

### 1. Enable the API

The API is enabled by default. If you need to configure ports, edit your config file:

```json
{
  "api": {
    "enabled": true,
    "wsPort": 8765,
    "httpPort": 8766
  }
}
```

### 2. Start Hime Display

```bash
npm start
```

The API server will start automatically. You should see:
```
[API Server] WebSocket listening on port 8765
[API Server] HTTP listening on port 8766
```

### 3. Test the Connection

**Option A: WebSocket (Python)**
```bash
pip install websockets
python examples/python_client.py
```

**Option B: WebSocket (Node.js)**
```bash
cd examples
npm install
node node_client.js
```

**Option C: HTTP (curl)**
```bash
curl -X POST http://localhost:8766 \
  -H "Content-Type: application/json" \
  -d '{"action":"showDisplay","data":{}}'
```

### 4. Send Your First Command

**Set an emotion (Python):**
```python
import asyncio
import websockets
import json

async def set_happy():
    async with websockets.connect("ws://localhost:8765") as ws:
        await ws.recv()  # Connection message
        
        command = {
            "action": "setParameters",
            "data": {
                "parameters": [
                    {"parameterId": "ParamMouthForm", "value": 1.0},
                    {"parameterId": "ParamEyeLOpen", "value": 0.9},
                    {"parameterId": "ParamEyeROpen", "value": 0.9}
                ]
            }
        }
        await ws.send(json.dumps(command))
        print("✓ Model is now happy!")

asyncio.run(set_happy())
```

## Common Use Cases

### AI Character (Neuro-sama style)

```python
# Take full control from your AI
await client.set_auto_breath(False)
await client.set_auto_eye_blink(False)
await client.set_track_mouse(False)

# React to conversation
if ai_emotion == "excited":
    await client.set_emotion("happy")
    await client.play_random_motion("joy")

# Speak when AI talks
await client.speak_animation(duration=2.0)

# Look at something
await client.look_at(x=0.5, y=0.2)
```

### MCP Server Integration

Create MCP tools that control the Live2D model:

```python
from mcp.server import Server
import aiohttp

server = Server("neuro-display")

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "express_emotion":
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:8766",
                json={
                    "action": "setEmotion",
                    "data": {"emotion": arguments["emotion"]}
                }
            ) as response:
                return await response.json()
```

### Sync with TTS

```python
# When your AI speaks
async def ai_speaks(text, audio_duration):
    # Disable auto features
    await client.set_auto_breath(False)
    
    # Play speaking animation for duration of audio
    await client.speak_animation(duration=audio_duration)
    
    # Re-enable after speaking
    await client.set_auto_breath(True)
```

## Key Parameters for Live2D

Here are the most commonly used parameters:

| Parameter | Range | Description |
|-----------|-------|-------------|
| `ParamAngleX` | -30 to 30 | Head rotation left/right |
| `ParamAngleY` | -30 to 30 | Head tilt up/down |
| `ParamEyeLOpen` | 0 to 1 | Left eye openness |
| `ParamEyeROpen` | 0 to 1 | Right eye openness |
| `ParamEyeBallX` | -1 to 1 | Eye direction horizontal |
| `ParamEyeBallY` | -1 to 1 | Eye direction vertical |
| `ParamMouthOpenY` | 0 to 1 | Mouth opening |
| `ParamMouthForm` | -1 to 1 | Mouth shape (smile/frown) |
| `ParamBreath` | 0 to 1 | Breathing intensity |

## Available Actions

- `setParameter` - Set a single parameter
- `setParameters` - Set multiple parameters at once
- `playMotion` - Play specific animation
- `playRandomMotion` - Play random animation from group
- `setAutoBreath` - Enable/disable breathing
- `setAutoEyeBlink` - Enable/disable blinking
- `setTrackMouse` - Enable/disable mouse tracking
- `showDisplay` - Show the window
- `hideDisplay` - Hide the window

See full documentation in `docs/API.md`

## Tips for AI Integration

1. **Disable Auto Features First**: Turn off auto breathing, blinking, and mouse tracking so your AI has full control
2. **Smooth Transitions**: Use small parameter changes with delays for natural movement
3. **Emotion Presets**: Create emotion combinations for quick switching
4. **Match TTS**: Sync speaking animations with your TTS audio duration
5. **Context-Aware**: Play different animation groups based on conversation context

## Troubleshooting

**Connection Refused**
- Make sure Hime Display is running
- Check that API is enabled in config
- Verify ports aren't in use by another application

**Model Not Responding**
- Ensure a Live2D model is loaded in the display window
- Check that the display window is open (`showDisplay` command)

**Parameter Not Working**
- Parameter names vary by model
- Use the control panel to see available parameters for your model
- Some parameters may not exist in all models

## Next Steps

1. Read the full API documentation: `docs/API.md`
2. Try the example clients: `examples/`
3. Check your model's available parameters in the control panel
4. Integrate with your AI system!

## Support

For issues or questions:
- Open an issue on GitHub
- Check the full API documentation
- Review the example implementations
