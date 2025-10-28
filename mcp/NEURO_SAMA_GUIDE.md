# Creating a Neuro-sama Style AI VTuber with Hime Display

This guide shows you how to create an AI VTuber that automatically animates based on AI responses, similar to Neuro-sama.

## 🎭 What You Get

- **Automatic Emotion Detection** - AI responses trigger appropriate facial expressions
- **Auto Lip-Sync** - Character's mouth moves naturally while "speaking"
- **Reactive Animations** - Character plays motions based on emotional context
- **Idle Behaviors** - Random movements and animations when not actively responding
- **Natural Expressions** - Looks around, blinks, and moves naturally
- **Real-time Response** - Character animates in sync with AI generation

## 📋 Prerequisites

1. **Hime Display** running with a Live2D model loaded
2. **LM Studio** with a language model loaded
3. **Python 3.8+** installed
4. **Dependencies** installed:
   ```powershell
   pip install websockets aiohttp
   ```

## 🚀 Quick Start

### Option 1: Direct Integration (Recommended for Testing)

This standalone mode lets you chat directly with animations:

```powershell
cd E:\programmingfiles\javascript\himedisplay\hime-display\mcp
python lmstudio_integration.py
```

**What this does:**
- Connects to both Hime Display and LM Studio
- Creates an interactive chat where you type messages
- AI responds and character animates automatically
- No need for MCP server configuration

**Usage:**
```
[You] Hello! How are you?
[Thinking...]
→ Emotion: happy
→ Speaking: 1.5s
[AI] Hi! I'm doing great! How can I help you today?
```

### Option 2: Test Auto-Animation System Only

Test just the animation system without LM Studio:

```powershell
python auto_animation_bridge.py
```

This runs pre-programmed test scenarios to show how animations work.

## 🎨 How It Works

### 1. Emotion Detection

The system analyzes AI responses for keywords and patterns:

```python
# Examples of automatic emotion detection:
"I'm so happy!" → happy emotion + excited animation
"Hmm, I'm not sure..." → confused emotion + head tilt
"Wow! That's amazing!!!" → surprised + excited animation
"I'm sorry to hear that" → sad emotion
```

### 2. Speaking Animation

Calculates speaking duration based on text length:
- ~0.15 seconds per word
- Natural mouth movement patterns
- Varies intensity for realism

### 3. Idle Behaviors

When not speaking, the character will:
- Look around randomly every 3-8 seconds
- Play idle animations every 10+ seconds
- Maintain natural breathing and blinking
- Never feels "frozen"

### 4. Reactive Animations

Strong emotions trigger motion groups:
- **Happy/Excited** → Motion/Greeting animations
- **Surprised** → Quick reactive motions
- **Question response** → Head tilt

## 🛠️ Configuration

### Customizing Emotion Keywords

Edit `auto_animation_bridge.py`:

```python
EMOTION_KEYWORDS = {
    'happy': ['happy', 'joy', 'great', 'awesome', 'wonderful', 'love'],
    # Add your own keywords
    'excited': ['excited', 'amazing', 'incredible', '!!!'],
}
```

### Adjusting Animation Timing

```python
# Speaking speed (words per second)
duration = words * 0.15  # Change 0.15 to adjust speed

# Idle behavior frequency
await asyncio.sleep(random.uniform(3, 8))  # Min 3s, Max 8s
```

### Changing LM Studio Endpoint

Edit `lmstudio_integration.py`:

```python
LM_STUDIO_API = "http://localhost:1234/v1"  # Change port if needed
```

### Emotion to Parameter Mapping

Customize how emotions affect the model in `auto_animation_bridge.py`:

```python
emotions = {
    "happy": [
        {"parameterId": "ParamMouthForm", "value": 1.0},
        {"parameterId": "ParamEyeLOpen", "value": 0.9},
        # Add more parameters for your specific model
    ],
}
```

## 🎯 Advanced Usage

### Integration with MCP Server

You can combine this with the MCP server for full control:

1. **Run the auto-animation bridge as a service**
2. **Use MCP server for manual overrides**
3. **Bridge handles automatic behaviors**
4. **MCP handles specific commands**

### Adding TTS Integration

To sync with text-to-speech:

```python
async def speak_with_tts(self, text: str, audio_duration: float):
    """Sync animation with actual audio"""
    await self.speak_animation(audio_duration, intensity=0.8)
```

### Custom Animation Triggers

Add specific triggers for certain phrases:

```python
# In auto_animation_bridge.py
async def process_ai_response(self, text: str):
    # Custom triggers
    if "hello" in text.lower():
        await self.send_command("playMotion", {"group": "greeting", "index": 0})
    
    if "bye" in text.lower():
        await self.send_command("playMotion", {"group": "farewell", "index": 0})
    
    # Continue with normal emotion detection
    emotion = EmotionAnalyzer.detect_emotion(text)
    await self.set_emotion(emotion)
```

### Personality Tuning

Adjust the system prompt in `lmstudio_integration.py`:

```python
self.system_prompt = {
    "role": "system",
    "content": """You are [Character Name], a [personality traits] AI VTuber.
    You love [interests] and often express yourself with [communication style].
    Use lots of punctuation to show emotion!"""
}
```

## 🎪 Creating Your Own Neuro-sama

### Character Personality

Make your AI more like Neuro-sama by:

1. **Expressive Language** - Tell the AI to use exclamation marks and emojis
2. **Quick Responses** - Use shorter max_tokens (200-500)
3. **Playful Tone** - System prompt emphasizing playfulness
4. **Reactive** - More emphasis on surprised/excited emotions

Example system prompt:

```python
system_prompt = {
    "role": "system",
    "content": """You are Hime, an energetic and playful AI VTuber!
    You love chatting with people and get excited easily.
    You're curious, a bit mischievous, and always show your emotions.
    Use ! for excitement, ? for questions, and ... when thinking.
    Keep responses conversational and under 100 words."""
}
```

### Animation Profiles

Create different animation profiles for different contexts:

```python
class AnimationProfile:
    ENERGETIC = {
        'idle_frequency': (2, 5),  # More frequent
        'speaking_intensity': 0.9,
        'emotion_emphasis': 1.5
    }
    
    CALM = {
        'idle_frequency': (5, 10),  # Less frequent
        'speaking_intensity': 0.5,
        'emotion_emphasis': 0.8
    }
```

### Stream Integration

For streaming platforms:

1. **Capture the output** to OBS using Window Capture
2. **Set transparency** in Hime Display for green screen
3. **Use the auto-animation bridge** as backend
4. **Connect to stream chat** for real-time interaction

```python
# Example: Connect to Twitch chat
async def on_twitch_message(username, message):
    response = await chatbot.chat(f"{username} says: {message}")
    # Post response to Twitch chat
    # Character animates automatically
```

## 🐛 Troubleshooting

### Character Not Animating

1. **Check Hime Display** - Model loaded and API enabled
2. **Check console output** - Look for error messages
3. **Test connection manually**:
   ```powershell
   python auto_animation_bridge.py
   ```

### LM Studio Connection Failed

1. **Start LM Studio's local server**:
   - In LM Studio: Developer → Start Server
   - Default: `http://localhost:1234`
2. **Load a model** in LM Studio
3. **Check port** matches in configuration

### Animations Too Slow/Fast

Adjust timing in `auto_animation_bridge.py`:

```python
# Speaking speed
duration = words * 0.10  # Faster (was 0.15)
duration = words * 0.20  # Slower (was 0.15)

# Animation delays
await asyncio.sleep(0.05)  # Faster frame rate
```

### Emotions Not Detecting Correctly

1. **Add more keywords** to `EMOTION_KEYWORDS`
2. **Adjust scoring** in `detect_emotion()`
3. **Check AI's punctuation** - More ! and ? help

### Too Many Idle Animations

Reduce frequency:

```python
await asyncio.sleep(random.uniform(10, 20))  # Less frequent (was 3-8)
```

## 📚 Examples

### Example 1: Greeting Sequence

```python
# User starts conversation
await bridge.on_user_message("Hello!")
# Character: looks at camera, slight tilt

# AI responds
await bridge.on_ai_response("Hi! Great to see you!")
# Character: happy emotion, speaking animation, may play greeting motion
```

### Example 2: Question Response

```python
# User asks question
await bridge.on_user_message("What's your favorite color?")
# Character: subtle head tilt (reacting to question)

# AI responds thoughtfully
await bridge.on_ai_response("Hmm, I really like blue! It reminds me of the sky.")
# Character: brief confused (thinking), then happy, speaks with animation
```

### Example 3: Excited Reaction

```python
# AI gets excited
await bridge.on_ai_response("OMG that's amazing!!! I can't believe it!!!")
# Character: surprised → excited emotion, greeting/motion animation, energetic speaking
```

## 🎬 Next Steps

1. **Test the basic system** with `lmstudio_integration.py`
2. **Customize emotions** for your character
3. **Tune the personality** with system prompts
4. **Add custom triggers** for specific phrases
5. **Integrate with streaming** if desired
6. **Add TTS** for voice synthesis
7. **Create interaction commands** for viewers

## 💡 Tips for Best Results

- **Use expressive models** - Models that naturally use punctuation work best
- **Shorter responses** - Keep AI responses under 50 words for snappy feel
- **Good Live2D model** - Models with rich parameters animate better
- **Test different profiles** - Try different animation intensities
- **Monitor performance** - Watch CPU usage, adjust animation complexity

## 🆘 Need Help?

- Check the main [README.md](./README.md) for MCP server details
- Review [INSTALL.md](./INSTALL.md) for setup issues
- Check [API.md](../docs/API.md) for command reference
- Open a GitHub issue with your specific problem

---

**Have fun creating your AI VTuber!** 🎉
