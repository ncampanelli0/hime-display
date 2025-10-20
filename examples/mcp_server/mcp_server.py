"""
MCP Server for controlling Hime Display Live2D models
Compatible with Claude Desktop and other MCP clients

This server provides tools for AI to control a Live2D character display,
perfect for creating AI VTuber systems like Neuro-sama.
"""

import asyncio
import json
from typing import Any, Sequence
import aiohttp
import websockets
from mcp.server import Server
from mcp.types import Tool, TextContent, EmbeddedResource


# Initialize MCP server
app = Server("hime-display-controller")

# Configuration
HIME_DISPLAY_WS = "ws://localhost:8765"
HIME_DISPLAY_HTTP = "http://localhost:8766"


class HimeDisplayConnection:
    """Manages connection to Hime Display"""
    
    def __init__(self):
        self.ws = None
        self.connected = False
    
    async def connect(self):
        """Connect to Hime Display WebSocket"""
        try:
            self.ws = await websockets.connect(HIME_DISPLAY_WS)
            self.connected = True
            # Read connection message
            await self.ws.recv()
            return True
        except Exception as e:
            print(f"Failed to connect to Hime Display: {e}")
            return False
    
    async def send_command(self, action: str, data: dict):
        """Send command via WebSocket"""
        if not self.connected:
            await self.connect()
        
        command = {"action": action, "data": data}
        await self.ws.send(json.dumps(command))
        response = await self.ws.recv()
        return json.loads(response)
    
    async def close(self):
        """Close connection"""
        if self.ws:
            await self.ws.close()
            self.connected = False


# Global connection instance
display_connection = HimeDisplayConnection()


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools for controlling the Live2D model"""
    return [
        Tool(
            name="set_emotion",
            description="Set the Live2D character's emotion (happy, sad, surprised, angry, confused, neutral)",
            inputSchema={
                "type": "object",
                "properties": {
                    "emotion": {
                        "type": "string",
                        "enum": ["happy", "sad", "surprised", "angry", "confused", "neutral"],
                        "description": "The emotion to display"
                    }
                },
                "required": ["emotion"]
            }
        ),
        Tool(
            name="play_animation",
            description="Play a Live2D animation from a specific group",
            inputSchema={
                "type": "object",
                "properties": {
                    "group": {
                        "type": "string",
                        "description": "Animation group name (e.g., 'idle', 'motion', 'greeting')"
                    },
                    "random": {
                        "type": "boolean",
                        "description": "Play a random animation from the group",
                        "default": True
                    }
                },
                "required": ["group"]
            }
        ),
        Tool(
            name="set_parameter",
            description="Set a specific Live2D parameter value for fine control",
            inputSchema={
                "type": "object",
                "properties": {
                    "parameter_id": {
                        "type": "string",
                        "description": "Parameter ID (e.g., 'ParamAngleX', 'ParamMouthOpenY')"
                    },
                    "value": {
                        "type": "number",
                        "description": "Parameter value"
                    }
                },
                "required": ["parameter_id", "value"]
            }
        ),
        Tool(
            name="speak",
            description="Animate the character speaking for a duration",
            inputSchema={
                "type": "object",
                "properties": {
                    "duration": {
                        "type": "number",
                        "description": "Duration in seconds",
                        "default": 1.0
                    },
                    "intensity": {
                        "type": "number",
                        "description": "Speaking intensity (0.0 to 1.0)",
                        "default": 0.7
                    }
                }
            }
        ),
        Tool(
            name="look_at",
            description="Make the character look in a specific direction",
            inputSchema={
                "type": "object",
                "properties": {
                    "x": {
                        "type": "number",
                        "description": "Horizontal direction (-1.0 left to 1.0 right)",
                        "minimum": -1.0,
                        "maximum": 1.0
                    },
                    "y": {
                        "type": "number",
                        "description": "Vertical direction (-1.0 down to 1.0 up)",
                        "minimum": -1.0,
                        "maximum": 1.0
                    }
                },
                "required": ["x", "y"]
            }
        ),
        Tool(
            name="control_auto_features",
            description="Enable or disable automatic features (breathing, blinking, mouse tracking)",
            inputSchema={
                "type": "object",
                "properties": {
                    "breath": {
                        "type": "boolean",
                        "description": "Enable automatic breathing"
                    },
                    "eye_blink": {
                        "type": "boolean",
                        "description": "Enable automatic eye blinking"
                    },
                    "track_mouse": {
                        "type": "boolean",
                        "description": "Enable mouse tracking"
                    }
                }
            }
        ),
        Tool(
            name="window_control",
            description="Show or hide the display window",
            inputSchema={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["show", "hide"],
                        "description": "Show or hide the window"
                    }
                },
                "required": ["action"]
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> Sequence[TextContent | EmbeddedResource]:
    """Handle tool calls"""
    
    try:
        if name == "set_emotion":
            emotion = arguments["emotion"]
            
            # Map emotions to parameter sets
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
                ]
            }
            
            await display_connection.send_command("setParameters", {
                "parameters": emotions[emotion]
            })
            
            return [TextContent(
                type="text",
                text=f"Set emotion to {emotion}"
            )]
        
        elif name == "play_animation":
            group = arguments["group"]
            
            if arguments.get("random", True):
                await display_connection.send_command("playRandomMotion", {"group": group})
                return [TextContent(
                    type="text",
                    text=f"Playing random animation from group '{group}'"
                )]
            else:
                await display_connection.send_command("playMotion", {
                    "group": group,
                    "index": 0
                })
                return [TextContent(
                    type="text",
                    text=f"Playing animation from group '{group}'"
                )]
        
        elif name == "set_parameter":
            parameter_id = arguments["parameter_id"]
            value = arguments["value"]
            
            await display_connection.send_command("setParameter", {
                "parameterId": parameter_id,
                "value": value
            })
            
            return [TextContent(
                type="text",
                text=f"Set {parameter_id} to {value}"
            )]
        
        elif name == "speak":
            duration = arguments.get("duration", 1.0)
            intensity = arguments.get("intensity", 0.7)
            
            # Disable auto breath
            await display_connection.send_command("setAutoBreath", {"enabled": False})
            
            # Animate mouth
            frames = int(duration * 10)
            for i in range(frames):
                value = intensity * abs((i % 4) - 2) / 2
                await display_connection.send_command("setParameter", {
                    "parameterId": "ParamMouthOpenY",
                    "value": value
                })
                await asyncio.sleep(0.1)
            
            # Close mouth
            await display_connection.send_command("setParameter", {
                "parameterId": "ParamMouthOpenY",
                "value": 0.0
            })
            
            # Re-enable auto breath
            await display_connection.send_command("setAutoBreath", {"enabled": True})
            
            return [TextContent(
                type="text",
                text=f"Played speaking animation for {duration} seconds"
            )]
        
        elif name == "look_at":
            x = arguments["x"]
            y = arguments["y"]
            
            await display_connection.send_command("setParameters", {
                "parameters": [
                    {"parameterId": "ParamEyeBallX", "value": x},
                    {"parameterId": "ParamEyeBallY", "value": y},
                    {"parameterId": "ParamAngleX", "value": x * 15},
                    {"parameterId": "ParamAngleY", "value": y * 10},
                ]
            })
            
            return [TextContent(
                type="text",
                text=f"Looking at direction ({x}, {y})"
            )]
        
        elif name == "control_auto_features":
            results = []
            
            if "breath" in arguments:
                await display_connection.send_command("setAutoBreath", {
                    "enabled": arguments["breath"]
                })
                results.append(f"Auto breath: {arguments['breath']}")
            
            if "eye_blink" in arguments:
                await display_connection.send_command("setAutoEyeBlink", {
                    "enabled": arguments["eye_blink"]
                })
                results.append(f"Auto eye blink: {arguments['eye_blink']}")
            
            if "track_mouse" in arguments:
                await display_connection.send_command("setTrackMouse", {
                    "enabled": arguments["track_mouse"]
                })
                results.append(f"Track mouse: {arguments['track_mouse']}")
            
            return [TextContent(
                type="text",
                text="Updated auto features: " + ", ".join(results)
            )]
        
        elif name == "window_control":
            action = arguments["action"]
            
            if action == "show":
                await display_connection.send_command("showDisplay", {})
                return [TextContent(type="text", text="Display window shown")]
            else:
                await display_connection.send_command("hideDisplay", {})
                return [TextContent(type="text", text="Display window hidden")]
        
        else:
            return [TextContent(
                type="text",
                text=f"Unknown tool: {name}"
            )]
    
    except Exception as e:
        return [TextContent(
            type="text",
            text=f"Error executing {name}: {str(e)}"
        )]


async def main():
    """Run the MCP server"""
    from mcp.server.stdio import stdio_server
    
    print("Starting Hime Display MCP Server...")
    print(f"Connecting to Hime Display at {HIME_DISPLAY_WS}")
    
    # Connect to Hime Display
    if await display_connection.connect():
        print("✓ Connected to Hime Display")
    else:
        print("✗ Failed to connect to Hime Display")
        print("Make sure Hime Display is running with API enabled")
        return
    
    try:
        async with stdio_server() as (read_stream, write_stream):
            await app.run(
                read_stream,
                write_stream,
                app.create_initialization_options()
            )
    finally:
        await display_connection.close()


if __name__ == "__main__":
    asyncio.run(main())
