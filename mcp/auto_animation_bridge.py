"""
Hime Display Auto-Animation Bridge for Neuro-sama-style AI VTuber
This bridge adds automatic emotion detection, lip-sync, and reactive behaviors
to make your AI character more lifelike and expressive.

Features:
- Automatic emotion detection from AI responses
- Auto lip-sync with speaking animations
- Idle behaviors when not talking
- Reaction animations to user messages
- Sentiment analysis for natural expressions
"""

import asyncio
import json
import re
import random
import time
from typing import Optional, List, Dict
import websockets


class EmotionAnalyzer:
    """Analyzes text to determine appropriate emotions"""
    
    EMOTION_KEYWORDS = {
        'happy': ['happy', 'joy', 'great', 'awesome', 'wonderful', 'love', 'excited', 'yay', '!', 'haha', 'lol'],
        'sad': ['sad', 'sorry', 'unfortunate', 'disappointed', 'miss', 'crying', 'tear'],
        'surprised': ['wow', 'omg', 'what', 'really', '?!', 'surprised', 'shocked', 'amazing'],
        'angry': ['angry', 'mad', 'annoyed', 'frustrated', 'grr', 'ugh', 'hate'],
        'confused': ['confused', 'hmm', 'uh', 'what', 'huh', 'understand', '??'],
        'worried': ['worried', 'concerned', 'anxious', 'nervous', 'hope', 'careful'],
        'excited': ['excited', 'can\'t wait', 'amazing', 'incredible', '!!!', 'omg'],
    }
    
    @classmethod
    def detect_emotion(cls, text: str) -> str:
        """Detect the primary emotion in text"""
        text_lower = text.lower()
        
        # Count emotion keyword matches
        scores = {emotion: 0 for emotion in cls.EMOTION_KEYWORDS}
        
        for emotion, keywords in cls.EMOTION_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    scores[emotion] += 1
        
        # Check punctuation for emphasis
        if '!' in text:
            scores['excited'] += text.count('!')
        if '?' in text and '!' in text:
            scores['surprised'] += 1
        if text.count('?') > 1:
            scores['confused'] += 1
        
        # Get highest scoring emotion
        max_score = max(scores.values())
        if max_score > 0:
            return max(scores.items(), key=lambda x: x[1])[0]
        
        return 'neutral'
    
    @classmethod
    def should_be_excited(cls, text: str) -> bool:
        """Check if text should trigger excited animation"""
        return '!!!' in text or text.count('!') >= 3


class AnimationController:
    """Controls character animations and behaviors"""
    
    def __init__(self, ws_url: str = "ws://localhost:8765"):
        self.ws_url = ws_url
        self.ws = None
        self.connected = False
        self.last_animation_time = 0
        self.idle_task = None
        self.speaking = False
        
    async def connect(self):
        """Connect to Hime Display"""
        try:
            self.ws = await websockets.connect(self.ws_url)
            self.connected = True
            await self.ws.recv()  # Welcome message
            print("✓ Connected to Hime Display")
            return True
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            return False
    
    async def send_command(self, action: str, data: dict):
        """Send command to Hime Display"""
        if not self.connected:
            await self.connect()
        
        try:
            command = {"action": action, "data": data}
            await self.ws.send(json.dumps(command))
            response = await self.ws.recv()
            return json.loads(response)
        except Exception as e:
            print(f"Command error: {e}")
            self.connected = False
            return None
    
    async def set_emotion(self, emotion: str):
        """Set character emotion with smooth transition"""
        emotions = {
            "happy": [
                {"parameterId": "ParamMouthForm", "value": 1.0},
                {"parameterId": "ParamEyeLOpen", "value": 0.9},
                {"parameterId": "ParamEyeROpen", "value": 0.9},
            ],
            "sad": [
                {"parameterId": "ParamMouthForm", "value": -1.0},
                {"parameterId": "ParamEyeLOpen", "value": 0.6},
                {"parameterId": "ParamEyeROpen", "value": 0.6},
                {"parameterId": "ParamAngleY", "value": -5},
            ],
            "surprised": [
                {"parameterId": "ParamMouthOpenY", "value": 0.8},
                {"parameterId": "ParamEyeLOpen", "value": 1.0},
                {"parameterId": "ParamEyeROpen", "value": 1.0},
            ],
            "angry": [
                {"parameterId": "ParamMouthForm", "value": -0.5},
                {"parameterId": "ParamEyeLOpen", "value": 0.7},
                {"parameterId": "ParamEyeROpen", "value": 0.7},
            ],
            "confused": [
                {"parameterId": "ParamMouthForm", "value": 0.2},
                {"parameterId": "ParamAngleX", "value": 10},
            ],
            "neutral": [
                {"parameterId": "ParamMouthForm", "value": 0.0},
                {"parameterId": "ParamEyeLOpen", "value": 1.0},
                {"parameterId": "ParamEyeROpen", "value": 1.0},
            ],
            "worried": [
                {"parameterId": "ParamMouthForm", "value": -0.3},
                {"parameterId": "ParamBrowLY", "value": 0.3},
                {"parameterId": "ParamBrowRY", "value": 0.3},
            ],
            "excited": [
                {"parameterId": "ParamMouthForm", "value": 1.0},
                {"parameterId": "ParamMouthOpenY", "value": 0.3},
                {"parameterId": "ParamEyeLOpen", "value": 1.0},
                {"parameterId": "ParamEyeROpen", "value": 1.0},
            ]
        }
        
        params = emotions.get(emotion, emotions["neutral"])
        await self.send_command("setParameters", {"parameters": params})
        print(f"→ Emotion: {emotion}")
    
    async def speak_animation(self, duration: float, intensity: float = 0.7):
        """Animate character speaking"""
        self.speaking = True
        
        # Disable auto breath
        await self.send_command("setAutoBreath", {"enabled": False})
        
        # Animate mouth with varied pattern for natural look
        frames = int(duration * 10)
        patterns = [
            [0.0, 0.5, 0.8, 0.5, 0.2, 0.6, 0.9, 0.4],  # Pattern 1
            [0.0, 0.3, 0.7, 0.9, 0.6, 0.3, 0.1, 0.5],  # Pattern 2
            [0.0, 0.6, 0.4, 0.8, 0.3, 0.7, 0.2, 0.5],  # Pattern 3
        ]
        
        pattern = random.choice(patterns)
        
        for i in range(frames):
            value = intensity * pattern[i % len(pattern)]
            await self.send_command("setParameter", {
                "parameterId": "ParamMouthOpenY",
                "value": value
            })
            await asyncio.sleep(0.1)
        
        # Close mouth
        await self.send_command("setParameter", {
            "parameterId": "ParamMouthOpenY",
            "value": 0.0
        })
        
        # Re-enable auto breath
        await self.send_command("setAutoBreath", {"enabled": True})
        
        self.speaking = False
        print(f"→ Speaking: {duration}s")
    
    async def play_reaction_animation(self, emotion: str):
        """Play a reaction animation based on emotion"""
        animation_map = {
            'happy': 'motion',
            'surprised': 'motion',
            'excited': 'greeting',
            'confused': 'idle',
            'sad': 'idle',
        }
        
        group = animation_map.get(emotion, 'idle')
        await self.send_command("playRandomMotion", {"group": group})
        self.last_animation_time = time.time()
        print(f"→ Animation: {group}")
    
    async def look_at_direction(self, x: float, y: float):
        """Make character look in a direction"""
        await self.send_command("setParameters", {
            "parameters": [
                {"parameterId": "ParamEyeBallX", "value": x},
                {"parameterId": "ParamEyeBallY", "value": y},
                {"parameterId": "ParamAngleX", "value": x * 15},
                {"parameterId": "ParamAngleY", "value": y * 10},
            ]
        })
    
    async def random_look(self):
        """Random eye/head movement for natural behavior"""
        x = random.uniform(-0.3, 0.3)
        y = random.uniform(-0.2, 0.2)
        await self.look_at_direction(x, y)
        print("→ Random look")
    
    async def idle_behavior_loop(self):
        """Background task for idle behaviors"""
        while True:
            try:
                await asyncio.sleep(random.uniform(3, 8))
                
                if not self.speaking:
                    # Random behavior
                    behavior = random.choice(['look', 'blink', 'idle_motion'])
                    
                    if behavior == 'look':
                        await self.random_look()
                    elif behavior == 'idle_motion':
                        # Don't spam animations
                        if time.time() - self.last_animation_time > 10:
                            await self.send_command("playRandomMotion", {"group": "idle"})
                            self.last_animation_time = time.time()
                            print("→ Idle animation")
            except Exception as e:
                print(f"Idle behavior error: {e}")
                await asyncio.sleep(5)
    
    def start_idle_behaviors(self):
        """Start background idle behavior task"""
        if self.idle_task is None or self.idle_task.done():
            self.idle_task = asyncio.create_task(self.idle_behavior_loop())
            print("✓ Idle behaviors started")
    
    async def process_ai_response(self, text: str):
        """Process AI response with automatic animations"""
        # Detect emotion
        emotion = EmotionAnalyzer.detect_emotion(text)
        
        # Set emotion
        await self.set_emotion(emotion)
        
        # Play reaction animation for strong emotions
        if emotion in ['surprised', 'excited', 'happy'] and EmotionAnalyzer.should_be_excited(text):
            await self.play_reaction_animation(emotion)
        
        # Calculate speaking duration based on text length
        words = len(text.split())
        duration = min(words * 0.15, 8.0)  # ~0.15s per word, max 8s
        
        # Speak animation
        if duration > 0.3:
            await self.speak_animation(duration)
    
    async def process_user_message(self, text: str):
        """React to user's message"""
        # Quick reactions to user
        if '?' in text:
            # Tilt head slightly when user asks question
            await self.look_at_direction(0.1, 0.1)
            print("→ Reacting to question")
    
    async def close(self):
        """Close connection"""
        if self.idle_task:
            self.idle_task.cancel()
        if self.ws:
            await self.ws.close()


class HimeDisplayBridge:
    """Main bridge for auto-animation integration"""
    
    def __init__(self):
        self.controller = AnimationController()
        self.running = False
    
    async def initialize(self):
        """Initialize the bridge"""
        print("=" * 60)
        print("Hime Display Auto-Animation Bridge")
        print("Neuro-sama-style AI VTuber System")
        print("=" * 60)
        
        # Connect to Hime Display
        if not await self.controller.connect():
            print("\n⚠ Could not connect to Hime Display")
            print("Make sure:")
            print("  1. Hime Display is running")
            print("  2. API is enabled")
            print("  3. A model is loaded")
            return False
        
        # Start idle behaviors
        self.controller.start_idle_behaviors()
        
        # Initial setup
        await self.controller.send_command("setAutoBreath", {"enabled": True})
        await self.controller.send_command("setAutoEyeBlink", {"enabled": True})
        await self.controller.send_command("setTrackMouse", {"enabled": False})
        
        print("\n✓ Bridge initialized and ready!")
        print("=" * 60)
        self.running = True
        return True
    
    async def on_user_message(self, message: str):
        """Handle user message"""
        print(f"\n[User] {message[:50]}...")
        await self.controller.process_user_message(message)
    
    async def on_ai_response(self, response: str):
        """Handle AI response with auto-animation"""
        print(f"\n[AI] {response[:50]}...")
        await self.controller.process_ai_response(response)
    
    async def shutdown(self):
        """Shutdown the bridge"""
        print("\nShutting down bridge...")
        self.running = False
        await self.controller.close()


# Example usage and testing
async def test_bridge():
    """Test the auto-animation bridge"""
    bridge = HimeDisplayBridge()
    
    if not await bridge.initialize():
        return
    
    # Simulate conversation
    test_scenarios = [
        ("Hello! How are you?", "Hi! I'm doing great! How can I help you today?"),
        ("Can you tell me a joke?", "Why did the AI go to therapy? Because it had too many issues to process! Haha!"),
        ("That's kind of sad...", "Aww, I'm sorry! Let me try a better one next time."),
        ("What's 2+2?", "That's easy! 2+2 equals 4. Did you want me to explain?"),
        ("You're amazing!", "Wow, thank you so much!!! That makes me so happy! 😊"),
    ]
    
    print("\n" + "=" * 60)
    print("Running test scenarios...")
    print("=" * 60)
    
    for user_msg, ai_msg in test_scenarios:
        await bridge.on_user_message(user_msg)
        await asyncio.sleep(0.5)
        
        await bridge.on_ai_response(ai_msg)
        await asyncio.sleep(3)
    
    print("\n" + "=" * 60)
    print("Test complete! Idle behaviors will continue...")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        # Keep running to show idle behaviors
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await bridge.shutdown()


if __name__ == "__main__":
    print("Starting Hime Display Auto-Animation Bridge...\n")
    try:
        asyncio.run(test_bridge())
    except KeyboardInterrupt:
        print("\nBridge stopped by user")
