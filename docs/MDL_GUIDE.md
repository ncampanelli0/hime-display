# Source Engine MDL Model Guide

## Overview

Hime Display now supports Source Engine `.mdl` model files, including characters from games like:
- **Left 4 Dead 2** (Survivors, Special Infected, Common Infected)
- **Half-Life 2** (Gordon Freeman, Alyx Vance, NPCs)
- **Team Fortress 2** (All classes)
- **Portal** (Chell, GLaDOS)
- **Counter-Strike: Source** (Player models)

## Required Files

Source Engine models require **three files** with the same base name:

```
survivor_namvet.mdl    # Model definition and bones
survivor_namvet.vtx    # Mesh vertex data
survivor_namvet.vvd    # Vertex data
```

Optional but recommended:
```
survivor_namvet.vmt    # Material definitions
survivor_namvet.vtf    # Texture files
```

## Getting Models

### From Game Files

1. **Locate your game installation** (e.g., Steam Library)
   ```
   Steam/steamapps/common/Left 4 Dead 2/left4dead2/models/
   ```

2. **Find character models**:
   - L4D2 Survivors: `models/survivors/`
   - L4D2 Infected: `models/infected/`
   - HL2 Characters: `models/humans/`

3. **Copy the required files** (.mdl, .vtx, .vvd) to your Hime Display model directory

### Using GCFScape (For extracting from VPK files)

1. Download GCFScape: https://developer.valvesoftware.com/wiki/GCFScape
2. Open the game's VPK file (e.g., `pak01_dir.vpk`)
3. Navigate to the models folder
4. Extract the model files you need

## Loading MDL Models

### Via Control Panel

1. Open Hime Display control panel
2. Click "Add Model"
3. Set **Model Type** to "SourceEngine"
4. Browse to the `.mdl` file location
5. Make sure the `.vtx` and `.vvd` files are in the same directory
6. Click "Load"

### Via API

```javascript
{
  "action": "loadModel",
  "data": {
    "name": "Bill (L4D2)",
    "modelType": "SourceEngine",
    "entranceFile": "file:///path/to/survivor_namvet.mdl"
  }
}
```

## Animation Sequences

Source Engine models use **animation sequences** instead of motion files. Common sequences:

### L4D2 Survivor Sequences
- `idle01`, `idle02`, `idle03` - Standing idle
- `walk_all` - Walking
- `run_all` - Running
- `crouch_idle` - Crouching
- `jump` - Jumping
- `attacka` - Primary attack
- `reload` - Reloading weapon
- `gesture_beckon` - Beckoning gesture
- `gesture_wave` - Waving

### Playing Sequences

Via API:
```json
{
  "action": "playSequence",
  "data": {
    "sequenceName": "run_all"
  }
}
```

Or by index:
```json
{
  "action": "playSequence",
  "data": {
    "sequenceIndex": 5
  }
}
```

## Bodygroups

Bodygroups allow switching model parts (e.g., different weapons, accessories).

### L4D2 Survivor Bodygroups
- **Bodygroup 0**: Main body (usually index 0)
- **Bodygroup 1**: Head variations
- **Bodygroup 2**: Weapons/props

Example - Change weapon:
```json
{
  "action": "setBodyGroup",
  "data": {
    "bodyGroupIndex": 2,
    "value": 1
  }
}
```

## Skins

Skins are texture variants (e.g., different colored uniforms).

```json
{
  "action": "setSkin",
  "data": {
    "skinIndex": 0
  }
}
```

## Animation Control

### Speed Control
```json
{
  "action": "setSequenceSpeed",
  "data": {
    "speed": 1.5
  }
}
```
- `0.5` = Half speed (slow motion)
- `1.0` = Normal speed
- `2.0` = Double speed

### Loop Control
```json
{
  "action": "setSequenceLoop",
  "data": {
    "loop": true
  }
}
```

### Stop Animation
```json
{
  "action": "stopSequence",
  "data": {}
}
```

## Complete Example: L4D2 Character

```python
import asyncio
import aiohttp
import random

async def animate_l4d2_survivor():
    """
    Example: Animate a Left 4 Dead 2 survivor with random actions
    """
    base_url = "http://localhost:8766"
    
    async with aiohttp.ClientSession() as session:
        # Load Bill from L4D2
        await session.post(base_url, json={
            "action": "loadModel",
            "data": {
                "name": "Bill",
                "modelType": "SourceEngine",
                "entranceFile": "file:///path/to/l4d2/models/survivors/survivor_namvet.mdl"
            }
        })
        
        print("Model loaded, starting animation sequence...")
        await asyncio.sleep(2)
        
        # Idle for a bit
        await session.post(base_url, json={
            "action": "playSequence",
            "data": {"sequenceName": "idle01"}
        })
        print("Playing idle animation...")
        await asyncio.sleep(3)
        
        # Start walking
        await session.post(base_url, json={
            "action": "playSequence",
            "data": {"sequenceName": "walk_all"}
        })
        print("Walking...")
        await asyncio.sleep(4)
        
        # Speed up to running
        await session.post(base_url, json={
            "action": "setSequenceSpeed",
            "data": {"speed": 1.5}
        })
        await session.post(base_url, json={
            "action": "playSequence",
            "data": {"sequenceName": "run_all"}
        })
        print("Running at 1.5x speed...")
        await asyncio.sleep(3)
        
        # Stop and reload weapon
        await session.post(base_url, json={
            "action": "setSequenceSpeed",
            "data": {"speed": 1.0}
        })
        await session.post(base_url, json={
            "action": "setSequenceLoop",
            "data": {"loop": false}
        })
        await session.post(base_url, json={
            "action": "playSequence",
            "data": {"sequenceName": "reload"}
        })
        print("Reloading weapon...")
        await asyncio.sleep(2)
        
        # Wave gesture
        await session.post(base_url, json={
            "action": "playSequence",
            "data": {"sequenceName": "gesture_wave"}
        })
        print("Waving!")
        await asyncio.sleep(2)
        
        # Back to idle
        await session.post(base_url, json={
            "action": "setSequenceLoop",
            "data": {"loop": true}
        })
        await session.post(base_url, json={
            "action": "playSequence",
            "data": {"sequenceName": "idle02"}
        })
        print("Back to idle.")

if __name__ == "__main__":
    asyncio.run(animate_l4d2_survivor())
```

## WebSocket Real-Time Control

For AI characters that need real-time response:

```python
import asyncio
import websockets
import json

async def realtime_l4d2_control():
    uri = "ws://localhost:8765"
    
    async with websockets.connect(uri) as websocket:
        # Load model
        await websocket.send(json.dumps({
            "action": "loadModel",
            "data": {
                "name": "Zoey",
                "modelType": "SourceEngine",
                "entranceFile": "file:///path/to/survivor_teenangst.mdl"
            }
        }))
        
        response = await websocket.recv()
        print(f"Load response: {response}")
        
        # Animation loop
        animations = ["idle01", "walk_all", "run_all", "crouch_idle"]
        
        for anim in animations:
            await websocket.send(json.dumps({
                "action": "playSequence",
                "data": {"sequenceName": anim}
            }))
            
            response = await websocket.recv()
            print(f"Animation {anim}: {response}")
            
            await asyncio.sleep(3)

asyncio.run(realtime_l4d2_control())
```

## Troubleshooting

### Model Not Loading
- **Check file paths**: Ensure `.mdl`, `.vtx`, and `.vvd` files are in the same directory
- **File permissions**: Make sure files are readable
- **Correct model type**: Set `modelType: "SourceEngine"` in load command

### Textures Missing
- Models may appear white/gray without texture files
- Copy `.vmt` and `.vtf` files from game's `materials/` folder
- Maintain the same directory structure as in the game

### Animations Not Playing
- Check sequence name spelling (case-sensitive)
- Use `sequenceIndex` if sequence name is unknown
- Some models have limited animation sequences

### Performance Issues
- Source Engine models can be high-poly
- Reduce `pixel-ratio` in display settings
- Disable `mdl-outline-effect` if needed

## Known Limitations

1. **Bone Animation**: Basic implementation, complex animations may not play correctly
2. **Physics**: Ragdoll and cloth physics not yet supported
3. **Attachments**: Weapon attachments may not display correctly
4. **Materials**: Advanced material effects may not render properly
5. **Facial Animations**: Flex animations (facial expressions) under development

## Future Improvements

- [ ] Full bone animation support
- [ ] Facial flex animation system
- [ ] Material and texture improvements
- [ ] Attachment system for weapons/props
- [ ] Physics simulation support
- [ ] Particle effects

## Resources

- **Valve Developer Wiki**: https://developer.valvesoftware.com/wiki/MDL
- **GCFScape Tool**: https://developer.valvesoftware.com/wiki/GCFScape
- **Source Engine Model Formats**: https://developer.valvesoftware.com/wiki/Model
- **L4D2 Model List**: Check your game's `models/survivors/` and `models/infected/` folders

## Support

For issues specific to MDL support, please include:
1. Model file name and source game
2. Error messages from console (F12 in browser)
3. Whether the model displays at all
4. Which animations/features are not working

Open an issue on GitHub with this information for assistance.
