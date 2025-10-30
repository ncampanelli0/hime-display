"""
Adaptive Animation Bridge for Models with Limited Features
Automatically detects what your model supports and adapts accordingly

This version is safer for models that may not have:
- All animation groups
- All parameters
- Complex motion support
"""

import asyncio
import json
import random
import time
from typing import Optional, List, Dict, Set
import websockets


class ModelCapabilities:
    """Tracks what the current model supports"""
    
    def __init__(self):
        self.supported_params: Set[str] = set()
        self.supported_groups: Set[str] = set()
        self.has_motions = False
        self.tested = False
        self.warnings_shown = set()  # Track which warnings we've already shown
    
    def mark_param_supported(self, param_id: str):
        """Mark a parameter as supported"""
        self.supported_params.add(param_id)
    
    def mark_group_supported(self, group: str):
        """Mark an animation group as supported"""
        self.supported_groups.add(group)
        self.has_motions = True
    
    def supports_param(self, param_id: str) -> bool:
        """Check if parameter is supported"""
        return param_id in self.supported_params
    
    def supports_group(self, group: str) -> bool:
        """Check if animation group is supported"""
        return group in self.supported_groups
    
    def should_warn(self, warning_key: str) -> bool:
        """Check if we should show a warning (only once per key)"""
        if warning_key not in self.warnings_shown:
            self.warnings_shown.add(warning_key)
            return True
        return False


class AdaptiveAnimationController:
    """Animation controller that adapts to model capabilities"""
    
    # Standard Live2D parameter sets - try these first
    BASIC_PARAMS = {
        'angles': ['ParamAngleX', 'ParamAngleY', 'ParamAngleZ'],
        'eyes': ['ParamEyeLOpen', 'ParamEyeROpen', 'ParamEyeBallX', 'ParamEyeBallY'],
        'mouth': ['ParamMouthOpenY', 'ParamMouthForm'],
        'body': ['ParamBodyAngleX', 'ParamBodyAngleY'],
        'brows': ['ParamBrowLY', 'ParamBrowRY', 'ParamBrowLForm', 'ParamBrowRForm'],
    }
    
    COMMON_GROUPS = ['idle', 'motion', 'greeting', 'tap_head', 'tap_body']
    
    def __init__(self, ws_url: str = "ws://localhost:8765"):
        self.ws_url = ws_url
        self.ws = None
        self.connected = False
        self.capabilities = ModelCapabilities()
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
        """Send command to Hime Display with error handling"""
        if not self.connected:
            await self.connect()
        
        try:
            command = {"action": action, "data": data}
            await self.ws.send(json.dumps(command))
            response = await self.ws.recv()
            result = json.loads(response)
            return result
        except Exception as e:
            print(f"⚠ Command error ({action}): {e}")
            self.connected = False
            return {"success": False, "error": str(e)}
    
    async def test_parameter(self, param_id: str) -> bool:
        """Test if a parameter exists by trying to set it"""
        result = await self.send_command("setParameter", {
            "parameterId": param_id,
            "value": 0
        })
        
        if result.get("success"):
            self.capabilities.mark_param_supported(param_id)
            return True
        return False
    
    async def test_animation_group(self, group: str) -> bool:
        """Test if an animation group exists"""
        result = await self.send_command("playRandomMotion", {"group": group})
        
        if result.get("success"):
            self.capabilities.mark_group_supported(group)
            return True
        return False
    
    async def probe_model_capabilities(self):
        """Discover what the model supports"""
        if self.capabilities.tested:
            return
        
        print("\n🔍 Probing model capabilities...")
        
        # Test parameters
        tested_count = 0
        for category, params in self.BASIC_PARAMS.items():
            for param in params:
                if await self.test_parameter(param):
                    tested_count += 1
                await asyncio.sleep(0.05)  # Don't spam
        
        print(f"  ✓ Found {tested_count} supported parameters")
        
        # Test animation groups
        group_count = 0
        for group in self.COMMON_GROUPS:
            if await self.test_animation_group(group):
                group_count += 1
            await asyncio.sleep(0.1)
        
        print(f"  ✓ Found {group_count} animation groups")
        
        # Show capability summary warnings
        if group_count == 0:
            print("  ℹ Model doesn't support animations")
        if not self.capabilities.supports_param("ParamMouthOpenY"):
            print("  ℹ Model doesn't support mouth animation")
        
        # Fallback: If nothing worked, assume basic support
        if not self.capabilities.supported_params:
            print("  ℹ Using fallback: Assuming basic parameter support")
            for params in self.BASIC_PARAMS.values():
                for param in params:
                    self.capabilities.mark_param_supported(param)
        
        self.capabilities.tested = True
        print("✓ Model capabilities detected\n")
    
    async def set_emotion_adaptive(self, emotion: str):
        """Set emotion using only available parameters"""
        print(f"→ Setting emotion: {emotion}")
        
        # Build parameter list based on what's available
        params_to_set = []
        
        emotion_configs = {
            "happy": {
                "ParamMouthForm": 1.0,
                "ParamEyeLOpen": 0.9,
                "ParamEyeROpen": 0.9,
            },
            "sad": {
                "ParamMouthForm": -1.0,
                "ParamEyeLOpen": 0.6,
                "ParamEyeROpen": 0.6,
                "ParamAngleY": -5,
            },
            "surprised": {
                "ParamMouthOpenY": 0.8,
                "ParamEyeLOpen": 1.0,
                "ParamEyeROpen": 1.0,
            },
            "neutral": {
                "ParamMouthForm": 0.0,
                "ParamMouthOpenY": 0.0,
                "ParamEyeLOpen": 1.0,
                "ParamEyeROpen": 1.0,
                "ParamAngleX": 0,
                "ParamAngleY": 0,
            }
        }
        
        config = emotion_configs.get(emotion, emotion_configs["neutral"])
        
        # Only use parameters that exist
        for param_id, value in config.items():
            if self.capabilities.supports_param(param_id):
                params_to_set.append({"parameterId": param_id, "value": value})
        
        if params_to_set:
            await self.send_command("setParameters", {"parameters": params_to_set})
            print(f"  Applied {len(params_to_set)} parameters")
        else:
            print(f"  ⚠ No compatible parameters for emotion")
    
    async def speak_animation_adaptive(self, duration: float, intensity: float = 0.7):
        """Speaking animation using available parameters"""
        self.speaking = True
        
        # Try to use mouth parameter
        if not self.capabilities.supports_param("ParamMouthOpenY"):
            self.speaking = False
            return
        
        print(f"→ Speaking animation: {duration:.1f}s")
        
        # Disable auto breath if supported
        await self.send_command("setAutoBreath", {"enabled": False})
        
        # Simple mouth animation
        frames = int(duration * 10)
        for i in range(frames):
            value = intensity * abs((i % 4) - 2) / 2
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
    
    async def play_animation_adaptive(self, emotion: str = None):
        """Play animation if model supports it"""
        if not self.capabilities.has_motions:
            return
        
        # Try to pick an appropriate group
        preferred_groups = {
            'happy': ['motion', 'greeting'],
            'excited': ['greeting', 'motion'],
            'surprised': ['motion'],
        }
        
        groups_to_try = preferred_groups.get(emotion, ['idle', 'motion'])
        
        for group in groups_to_try:
            if self.capabilities.supports_group(group):
                await self.send_command("playRandomMotion", {"group": group})
                print(f"  Played animation: {group}")
                self.last_animation_time = time.time()
                return
        
        print("  ℹ No compatible animation groups found")
    
    async def look_at_adaptive(self, x: float, y: float):
        """Look direction using available parameters"""
        params_to_set = []
        
        # Eye movement
        if self.capabilities.supports_param("ParamEyeBallX"):
            params_to_set.append({"parameterId": "ParamEyeBallX", "value": x})
        if self.capabilities.supports_param("ParamEyeBallY"):
            params_to_set.append({"parameterId": "ParamEyeBallY", "value": y})
        
        # Head rotation
        if self.capabilities.supports_param("ParamAngleX"):
            params_to_set.append({"parameterId": "ParamAngleX", "value": x * 15})
        if self.capabilities.supports_param("ParamAngleY"):
            params_to_set.append({"parameterId": "ParamAngleY", "value": y * 10})
        
        if params_to_set:
            await self.send_command("setParameters", {"parameters": params_to_set})
            print(f"→ Looking (x={x:.1f}, y={y:.1f})")
        else:
            print("  ℹ Model doesn't support gaze control")
    
    async def idle_behavior_loop(self):
        """Background idle behaviors"""
        while True:
            try:
                await asyncio.sleep(random.uniform(5, 10))
                
                if not self.speaking:
                    # Random look
                    if random.random() > 0.5:
                        x = random.uniform(-0.3, 0.3)
                        y = random.uniform(-0.2, 0.2)
                        await self.look_at_adaptive(x, y)
                    
                    # Occasional idle animation
                    if (self.capabilities.has_motions and 
                        time.time() - self.last_animation_time > 15):
                        if self.capabilities.supports_group('idle'):
                            await self.send_command("playRandomMotion", {"group": "idle"})
                            self.last_animation_time = time.time()
                            print("→ Idle animation")
            
            except Exception as e:
                print(f"Idle behavior error: {e}")
                await asyncio.sleep(5)
    
    def start_idle_behaviors(self):
        """Start idle behaviors"""
        if self.idle_task is None or self.idle_task.done():
            self.idle_task = asyncio.create_task(self.idle_behavior_loop())
            print("✓ Idle behaviors started")
    
    async def close(self):
        """Close connection"""
        if self.idle_task:
            self.idle_task.cancel()
        if self.ws:
            await self.ws.close()


class SimpleBridge:
    """Simplified bridge for basic models"""
    
    def __init__(self):
        self.controller = AdaptiveAnimationController()
        self.running = False
    
    async def initialize(self):
        """Initialize the bridge"""
        print("=" * 60)
        print("Adaptive Auto-Animation Bridge")
        print("Works with any Live2D model")
        print("=" * 60)
        
        if not await self.controller.connect():
            print("\n⚠ Could not connect to Hime Display")
            return False
        
        # Probe what the model can do
        await self.controller.probe_model_capabilities()
        
        # Start idle behaviors
        self.controller.start_idle_behaviors()
        
        # Enable basic features
        await self.controller.send_command("setAutoBreath", {"enabled": True})
        await self.controller.send_command("setAutoEyeBlink", {"enabled": True})
        
        print("✓ Bridge initialized and ready!")
        print("=" * 60)
        self.running = True
        return True
    
    async def on_ai_response_start(self):
        """Called when AI starts responding (for quick reactions)"""
        # Quick look gesture
        x = random.uniform(-0.3, 0.3)
        y = random.uniform(-0.1, 0.2)
        await self.controller.look_at_adaptive(x, y)
    
    async def on_ai_response_complete(self, response: str):
        """Called when AI completes response (for emotion and speaking)"""
        # Simple emotion detection
        emotion = "neutral"
        if any(word in response.lower() for word in ['happy', '!', 'great', 'awesome']):
            emotion = "happy"
        elif '?' in response:
            emotion = "neutral"
        elif any(word in response.lower() for word in ['sad', 'sorry']):
            emotion = "sad"
        
        # Set emotion
        await self.controller.set_emotion_adaptive(emotion)
        
        # Play animation if excited
        if response.count('!') >= 2:
            await self.controller.play_animation_adaptive(emotion)
        
        # Speaking animation
        words = len(response.split())
        duration = min(words * 0.15, 8.0)
        if duration > 0.3:
            await self.controller.speak_animation_adaptive(duration)
    
    async def on_ai_response(self, response: str):
        """Process AI response adaptively (legacy method)"""
        await self.on_ai_response_complete(response)
    
    async def shutdown(self):
        """Shutdown"""
        print("\nShutting down...")
        self.running = False
        await self.controller.close()


# Can be imported by lmstudio_integration.py
async def test_adaptive_bridge():
    """Test the adaptive bridge"""
    bridge = SimpleBridge()
    
    if not await bridge.initialize():
        return
    
    # Test with some responses
    test_responses = [
        "Hi! I'm doing great!",
        "Hmm, I'm not sure about that...",
        "Wow! That's amazing!!!",
    ]
    
    print("\n" + "=" * 60)
    print("Testing animations...")
    print("=" * 60)
    
    for response in test_responses:
        await bridge.on_ai_response(response)
        await asyncio.sleep(3)
    
    print("\n✓ Test complete!")
    print("Idle behaviors will continue. Press Ctrl+C to stop.")
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await bridge.shutdown()


if __name__ == "__main__":
    print("Testing Adaptive Animation Bridge...\n")
    try:
        asyncio.run(test_adaptive_bridge())
    except KeyboardInterrupt:
        print("\nStopped")
