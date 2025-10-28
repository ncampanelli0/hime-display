# Model Compatibility Guide

## What if my Live2D model has limited features?

**Don't worry!** The adaptive animation system automatically detects what your model supports and works with what's available.

## Two Animation Systems

### 1. **Full Featured** (`auto_animation_bridge.py`)
- Assumes model has all standard parameters
- Uses all 8 emotions with complex parameter sets
- Attempts to play animations from various groups
- Best for: Complete Live2D models with motions

### 2. **Adaptive** (`adaptive_animation.py`) ✨ **RECOMMENDED**
- **Automatically detects** what your model supports
- Tests parameters before using them
- Gracefully handles missing features
- Works with **any** Live2D model
- Best for: All models, especially simple/basic ones

## How the Adaptive System Works

### On Startup
```
🔍 Probing model capabilities...
  ✓ Found 8 supported parameters
  ✓ Found 2 animation groups
✓ Model capabilities detected
```

The system:
1. **Tests common parameters** (mouth, eyes, angles, etc.)
2. **Tests animation groups** (idle, motion, greeting, etc.)
3. **Remembers what works**
4. **Only uses supported features** going forward

### During Operation

**If your model has:**
- ✅ **Mouth parameter** → Speaking animation works
- ❌ **No mouth parameter** → Skips speaking animation
- ✅ **Eye parameters** → Gaze control works
- ❌ **No eye parameters** → Uses head angles only
- ✅ **Motion groups** → Plays animations
- ❌ **No motion groups** → Uses parameter changes only

## Common Model Types

### Type 1: Full Featured Model
**Has:** All parameters, multiple motion groups, expressions
```
✓ Found 15+ parameters
✓ Found 4+ animation groups
```
**Result:** Full animation experience with emotions, motions, speaking

### Type 2: Standard Model
**Has:** Basic parameters (mouth, eyes, angles), some motions
```
✓ Found 8-12 parameters
✓ Found 1-3 animation groups
```
**Result:** Good animation experience, may not have all gestures

### Type 3: Basic/Simple Model
**Has:** Minimal parameters (eyes, maybe mouth)
```
✓ Found 3-6 parameters
✓ Found 0 animation groups
```
**Result:** Basic animation through parameter changes only

### Type 4: Very Basic Model
**Has:** Only essential parameters
```
✓ Found 2-3 parameters
✓ Found 0 animation groups
```
**Result:** Limited animation, but system still works

## What Gets Adapted

### Emotions
The system tries to set emotion parameters in order of importance:

**Priority 1:** Eyes (essential for emotions)
- `ParamEyeLOpen`, `ParamEyeROpen`

**Priority 2:** Mouth (shows happy/sad)
- `ParamMouthForm`, `ParamMouthOpenY`

**Priority 3:** Head angle (adds character)
- `ParamAngleX`, `ParamAngleY`

**Priority 4:** Eyebrows (enhances expression)
- `ParamBrowLY`, `ParamBrowRY`

**Priority 5:** Body movement (subtle)
- `ParamBodyAngleX`, `ParamBodyAngleY`

### Speaking Animation
```python
# If model has ParamMouthOpenY
→ Speaking: 2.3s  # Animated mouth movement

# If model doesn't have it
ℹ Model doesn't support mouth animation  # Gracefully skipped
```

### Motion Animations
```python
# If model has motion groups
→ Played animation: greeting

# If model doesn't have any
ℹ Model doesn't support animations  # Uses parameter changes only
```

### Gaze Control
```python
# Full support: eyes + head
→ Looking (x=0.5, y=0.2)  # Uses ParamEyeBallX/Y + ParamAngleX/Y

# Partial support: head only
→ Looking (x=0.5, y=0.2)  # Uses ParamAngleX/Y only

# No support
ℹ Model doesn't support gaze control  # Skipped
```

## How to Use

### Default (Adaptive - Recommended)
```powershell
python lmstudio_integration.py
```

This now uses the adaptive system by default!

### Test Your Model
```powershell
python adaptive_animation.py
```

This runs capability detection and shows what your model supports.

### Use Full Featured (If You Know Your Model Has Everything)
Edit `lmstudio_integration.py`:
```python
from auto_animation_bridge import HimeDisplayBridge  # Full featured
# from adaptive_animation import SimpleBridge  # Adaptive
```

## Troubleshooting

### "No compatible parameters for emotion"
**Cause:** Model has very non-standard parameter names

**Solution:** 
1. Find your model's parameter IDs (usually in the .model3.json file)
2. Edit `adaptive_animation.py` → `BASIC_PARAMS` to add your parameter names
3. Re-run the capability detection

### "Model doesn't support animations"
**Cause:** Model has no motion groups or they're named differently

**Solution:** This is fine! The system will use parameter changes for emotions instead. If your model does have motions:
1. Check the motion group names in your model files
2. Edit `adaptive_animation.py` → `COMMON_GROUPS` to add your group names

### Animations Look Wrong
**Cause:** Parameter values might be inverted or scaled differently

**Solution:** Adjust the emotion configurations in `adaptive_animation.py`:
```python
emotion_configs = {
    "happy": {
        "ParamMouthForm": 1.0,  # Try -1.0 if inverted
        "ParamEyeLOpen": 0.9,   # Try different values 0.0-1.0
    }
}
```

### Want to See What's Detected
Look at the startup output:
```
🔍 Probing model capabilities...
  ✓ Found 8 supported parameters
  ✓ Found 2 animation groups
✓ Model capabilities detected
```

For more details, edit `adaptive_animation.py` and add:
```python
# After capability detection
print(f"Supported params: {self.capabilities.supported_params}")
print(f"Supported groups: {self.capabilities.supported_groups}")
```

## Benefits of Adaptive System

✅ **Works with ANY model** - No setup required  
✅ **No crashes** - Gracefully handles missing features  
✅ **Automatic** - Detects capabilities on startup  
✅ **Efficient** - Only uses what the model supports  
✅ **Informative** - Tells you what it's doing  

## Summary

**You don't need to worry about model compatibility!** The adaptive system:
1. Automatically detects what your model can do
2. Uses only the features it finds
3. Gracefully handles missing features
4. Works with everything from basic to advanced models

Just run `python lmstudio_integration.py` and it will work with your model! 🎉
