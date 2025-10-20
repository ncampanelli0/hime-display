"""
Simple Python client for controlling Hime Display Live2D models
Perfect for AI character integration like Neuro-sama
"""

import asyncio
import websockets
import json
from typing import Dict, List, Optional


class HimeDisplayClient:
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.url = f"ws://{host}:{port}"
        self.websocket = None
        self.connected = False

    async def connect(self):
        """Connect to Hime Display WebSocket server"""
        try:
            self.websocket = await websockets.connect(self.url)
            self.connected = True
            response = await self.websocket.recv()
            print(f"✓ Connected: {json.loads(response)}")
            return True
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            return False

    async def send_command(self, action: str, data: Dict) -> Dict:
        """Send a command and wait for acknowledgment"""
        if not self.connected:
            raise ConnectionError("Not connected to Hime Display")

        command = {"action": action, "data": data}
        await self.websocket.send(json.dumps(command))
        
        # Wait for acknowledgment
        response = await self.websocket.recv()
        return json.loads(response)

    async def disconnect(self):
        """Close connection"""
        if self.websocket:
            await self.websocket.close()
            self.connected = False
            print("✓ Disconnected")

    # Convenience methods for common operations

    async def set_parameter(self, parameter_id: str, value: float):
        """Set a single Live2D parameter"""
        return await self.send_command("setParameter", {
            "parameterId": parameter_id,
            "value": value
        })

    async def set_parameters(self, parameters: List[Dict[str, float]]):
        """Set multiple Live2D parameters at once"""
        return await self.send_command("setParameters", {
            "parameters": parameters
        })

    async def play_motion(self, group: str, index: Optional[int] = None, file: Optional[str] = None):
        """Play a specific motion animation"""
        data = {"group": group}
        if index is not None:
            data["index"] = index
        if file:
            data["file"] = file
        return await self.send_command("playMotion", data)

    async def play_random_motion(self, group: Optional[str] = None):
        """Play a random motion from specified group or any group"""
        data = {"group": group} if group else {}
        return await self.send_command("playRandomMotion", data)

    async def set_auto_breath(self, enabled: bool):
        """Enable or disable automatic breathing"""
        return await self.send_command("setAutoBreath", {"enabled": enabled})

    async def set_auto_eye_blink(self, enabled: bool):
        """Enable or disable automatic eye blinking"""
        return await self.send_command("setAutoEyeBlink", {"enabled": enabled})

    async def set_track_mouse(self, enabled: bool):
        """Enable or disable mouse tracking"""
        return await self.send_command("setTrackMouse", {"enabled": enabled})

    async def show_display(self):
        """Show the display window"""
        return await self.send_command("showDisplay", {})

    async def hide_display(self):
        """Hide the display window"""
        return await self.send_command("hideDisplay", {})

    # High-level emotion control

    async def set_emotion(self, emotion: str):
        """
        Set model emotion using predefined parameter sets
        Emotions: happy, sad, angry, surprised, confused, neutral
        """
        emotions = {
            "happy": [
                {"parameterId": "ParamMouthForm", "value": 1.0},
                {"parameterId": "ParamEyeLOpen", "value": 0.9},
                {"parameterId": "ParamEyeROpen", "value": 0.9},
                {"parameterId": "ParamEyeBallY", "value": -0.1},
            ],
            "sad": [
                {"parameterId": "ParamMouthForm", "value": -1.0},
                {"parameterId": "ParamEyeLOpen", "value": 0.6},
                {"parameterId": "ParamEyeROpen", "value": 0.6},
                {"parameterId": "ParamAngleY", "value": -5},
            ],
            "angry": [
                {"parameterId": "ParamMouthForm", "value": -0.5},
                {"parameterId": "ParamEyeLOpen", "value": 0.7},
                {"parameterId": "ParamEyeROpen", "value": 0.7},
                {"parameterId": "ParamBrowLY", "value": -1.0},
                {"parameterId": "ParamBrowRY", "value": -1.0},
            ],
            "surprised": [
                {"parameterId": "ParamMouthOpenY", "value": 0.8},
                {"parameterId": "ParamEyeLOpen", "value": 1.0},
                {"parameterId": "ParamEyeROpen", "value": 1.0},
                {"parameterId": "ParamBrowLY", "value": 1.0},
                {"parameterId": "ParamBrowRY", "value": 1.0},
            ],
            "confused": [
                {"parameterId": "ParamMouthForm", "value": 0.2},
                {"parameterId": "ParamAngleX", "value": 10},
                {"parameterId": "ParamEyeBallX", "value": 0.5},
            ],
            "neutral": [
                {"parameterId": "ParamMouthForm", "value": 0.0},
                {"parameterId": "ParamMouthOpenY", "value": 0.0},
                {"parameterId": "ParamEyeLOpen", "value": 1.0},
                {"parameterId": "ParamEyeROpen", "value": 1.0},
                {"parameterId": "ParamAngleX", "value": 0},
                {"parameterId": "ParamAngleY", "value": 0},
            ],
        }

        if emotion.lower() not in emotions:
            raise ValueError(f"Unknown emotion: {emotion}. Available: {', '.join(emotions.keys())}")

        return await self.set_parameters(emotions[emotion.lower()])

    async def look_at(self, x: float, y: float):
        """
        Make the model look at a specific direction
        x, y: -1.0 to 1.0 (normalized screen coordinates)
        """
        return await self.set_parameters([
            {"parameterId": "ParamEyeBallX", "value": x},
            {"parameterId": "ParamEyeBallY", "value": y},
            {"parameterId": "ParamAngleX", "value": x * 15},  # Head follows slightly
            {"parameterId": "ParamAngleY", "value": y * 10},
        ])

    async def speak_animation(self, duration: float = 1.0, intensity: float = 0.7):
        """
        Animate mouth opening/closing to simulate speaking
        duration: seconds to animate
        intensity: 0.0 to 1.0
        """
        frames = int(duration * 10)  # 10 FPS
        for i in range(frames):
            value = intensity * abs((i % 4) - 2) / 2  # Triangle wave
            await self.set_parameter("ParamMouthOpenY", value)
            await asyncio.sleep(0.1)
        
        # Close mouth at end
        await self.set_parameter("ParamMouthOpenY", 0.0)


# Example usage
async def demo():
    """Demonstration of the API"""
    client = HimeDisplayClient()
    
    if not await client.connect():
        return

    try:
        print("\n=== Hime Display API Demo ===\n")

        # Show the display window
        print("1. Showing display window...")
        await client.show_display()
        await asyncio.sleep(1)

        # Take full control
        print("2. Taking full control (disabling auto features)...")
        await client.set_auto_breath(False)
        await client.set_auto_eye_blink(False)
        await client.set_track_mouse(False)
        await asyncio.sleep(1)

        # Demonstrate emotions
        emotions = ["neutral", "happy", "surprised", "sad", "angry", "confused"]
        for emotion in emotions:
            print(f"3. Setting emotion: {emotion}")
            await client.set_emotion(emotion)
            await asyncio.sleep(2)

        # Back to neutral
        await client.set_emotion("neutral")

        # Play animation
        print("4. Playing random idle animation...")
        await client.play_random_motion("idle")
        await asyncio.sleep(2)

        # Look around
        print("5. Looking around...")
        directions = [(1, 0), (0, 1), (-1, 0), (0, -1), (0, 0)]
        for x, y in directions:
            await client.look_at(x, y)
            await asyncio.sleep(0.5)

        # Speaking animation
        print("6. Speaking animation...")
        await client.speak_animation(duration=2.0, intensity=0.8)
        await asyncio.sleep(1)

        # Re-enable auto features
        print("7. Re-enabling auto features...")
        await client.set_auto_breath(True)
        await client.set_auto_eye_blink(True)
        await client.set_track_mouse(True)

        print("\n✓ Demo complete!")

    except Exception as e:
        print(f"✗ Error during demo: {e}")
    finally:
        await client.disconnect()


if __name__ == "__main__":
    print("Hime Display Python Client")
    print("=" * 40)
    asyncio.run(demo())
