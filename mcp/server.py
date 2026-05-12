# /// script
# requires-python = ">=3.8"
# dependencies = [
#   "mcp>=0.9.0",
#   "websockets>=12.0",
#   "aiohttp>=3.9.0",
# ]
# ///

"""
Hime Display MCP Server for LM Studio
Model Context Protocol server for controlling Live2D characters

This server enables AI assistants in LM Studio to control Hime Display
Live2D models in real-time through natural language commands.
"""

import asyncio
import json
import sys
from typing import Any, Sequence
import websockets
from mcp.server import Server
from mcp.types import Tool, TextContent, EmbeddedResource


# Configuration
HIME_DISPLAY_WS = "ws://localhost:8765"
HIME_DISPLAY_HTTP = "http://localhost:8766"

# Initialize MCP server
app = Server("hime-display")


class HimeDisplayConnection:
    """Manages WebSocket connection to Hime Display"""
    
    def __init__(self, ws_url: str):
        self.ws_url = ws_url
        self.ws = None
        self.connected = False
    
    async def connect(self):
        """Establish WebSocket connection"""
        try:
            self.ws = await websockets.connect(self.ws_url)
            self.connected = True
            # Read initial connection message
            welcome = await self.ws.recv()
            print(f"[Hime Display] {welcome}", file=sys.stderr)
            return True
        except Exception as e:
            print(f"[Error] Failed to connect: {e}", file=sys.stderr)
            return False
    
    async def send_command(self, action: str, data: dict):
        """Send command to Hime Display"""
        if not self.connected:
            if not await self.connect():
                raise ConnectionError("Not connected to Hime Display")
        
        try:
            command = {"action": action, "data": data}
            await self.ws.send(json.dumps(command))
            response = await self.ws.recv()
            return json.loads(response)
        except websockets.exceptions.ConnectionClosed:
            self.connected = False
            raise ConnectionError("Connection lost")
        except Exception as e:
            raise Exception(f"Command failed: {e}")
    
    async def close(self):
        """Close connection"""
        if self.ws:
            await self.ws.close()
            self.connected = False


# Global connection instance
display = HimeDisplayConnection(HIME_DISPLAY_WS)


@app.list_tools()
async def list_tools() -> list[Tool]:
    """Define available tools for controlling the Live2D model"""
    return [
        Tool(
            name="set_emotion",
            description="Set the Live2D character's emotional expression. Use this when the AI wants to express or display a specific emotion through the character.",
            inputSchema={
                "type": "object",
                "properties": {
                    "emotion": {
                        "type": "string",
                        "enum": ["happy", "sad", "surprised", "angry", "confused", "neutral", "worried", "excited"],
                        "description": "The emotion to display on the character's face"
                    }
                },
                "required": ["emotion"]
            }
        ),
        Tool(
            name="play_animation",
            description="Play a Live2D animation from a specific motion group. Common groups include 'idle', 'motion', 'greeting', 'tap_head', 'tap_body'. Use this to make the character perform actions.",
            inputSchema={
                "type": "object",
                "properties": {
                    "group": {
                        "type": "string",
                        "description": "Animation group name (e.g., 'idle', 'motion', 'greeting', 'tap_head')"
                    },
                    "random": {
                        "type": "boolean",
                        "description": "If true, play a random animation from the group. Default: true",
                        "default": True
                    }
                },
                "required": ["group"]
            }
        ),
        Tool(
            name="set_parameter",
            description="Set a specific Live2D parameter value for fine control of the model. Use this for precise control of facial features or body parts. Common parameters include ParamAngleX, ParamMouthOpenY, ParamEyeBallX, etc.",
            inputSchema={
                "type": "object",
                "properties": {
                    "parameter_id": {
                        "type": "string",
                        "description": "Parameter ID (e.g., 'ParamAngleX' for head rotation, 'ParamMouthOpenY' for mouth opening)"
                    },
                    "value": {
                        "type": "number",
                        "description": "Parameter value (typically -30 to 30 for angles, 0 to 1 for openness)"
                    }
                },
                "required": ["parameter_id", "value"]
            }
        ),
        Tool(
            name="speak",
            description="Animate the character's mouth to simulate speaking. Use this when the character is talking or responding verbally.",
            inputSchema={
                "type": "object",
                "properties": {
                    "duration": {
                        "type": "number",
                        "description": "Duration of the speaking animation in seconds",
                        "default": 1.0,
                        "minimum": 0.1,
                        "maximum": 10.0
                    },
                    "intensity": {
                        "type": "number",
                        "description": "Speaking intensity/mouth opening amount (0.0 to 1.0)",
                        "default": 0.7,
                        "minimum": 0.0,
                        "maximum": 1.0
                    }
                }
            }
        ),
        Tool(
            name="look_at",
            description="Make the character look in a specific direction. Use this to direct the character's gaze or simulate looking at something.",
            inputSchema={
                "type": "object",
                "properties": {
                    "x": {
                        "type": "number",
                        "description": "Horizontal direction: -1.0 (left) to 1.0 (right), 0.0 is center",
                        "minimum": -1.0,
                        "maximum": 1.0
                    },
                    "y": {
                        "type": "number",
                        "description": "Vertical direction: -1.0 (down) to 1.0 (up), 0.0 is center",
                        "minimum": -1.0,
                        "maximum": 1.0
                    }
                },
                "required": ["x", "y"]
            }
        ),
        Tool(
            name="control_auto_features",
            description="Enable or disable automatic features like breathing, eye blinking, and mouse tracking. Turn these off for full manual control, or enable them for more natural behavior.",
            inputSchema={
                "type": "object",
                "properties": {
                    "breath": {
                        "type": "boolean",
                        "description": "Enable/disable automatic breathing animation"
                    },
                    "eye_blink": {
                        "type": "boolean",
                        "description": "Enable/disable automatic eye blinking"
                    },
                    "track_mouse": {
                        "type": "boolean",
                        "description": "Enable/disable mouse cursor tracking with the eyes"
                    }
                }
            }
        ),
        Tool(
            name="window_control",
            description="Show or hide the Hime Display window. Use this to control the visibility of the character display.",
            inputSchema={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["show", "hide"],
                        "description": "Action to perform: 'show' to make window visible, 'hide' to hide it"
                    }
                },
                "required": ["action"]
            }
        ),
        Tool(
            name="stop_animation",
            description="Stop the currently playing animation/motion on the character.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="set_expression",
            description="Set a named expression on the Live2D model. Expressions are predefined in the model file (e.g., 'f01', 'f02', 'happy', 'angry'). Use get_model_info to see available expressions.",
            inputSchema={
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Expression name or ID as defined in the model's expression list"
                    }
                },
                "required": ["expression"]
            }
        ),
        Tool(
            name="set_parameters",
            description="Set multiple Live2D parameters at once in a single call. More efficient than calling set_parameter repeatedly. Use for coordinated multi-parameter changes.",
            inputSchema={
                "type": "object",
                "properties": {
                    "parameters": {
                        "type": "array",
                        "description": "List of parameter objects to set simultaneously",
                        "items": {
                            "type": "object",
                            "properties": {
                                "parameter_id": {"type": "string", "description": "Parameter ID (e.g., ParamAngleX)"},
                                "value": {"type": "number", "description": "Parameter value"}
                            },
                            "required": ["parameter_id", "value"]
                        }
                    }
                },
                "required": ["parameters"]
            }
        ),
        Tool(
            name="set_part",
            description="Control the visibility/opacity of a model part such as clothing, accessories, or hair. Value 1.0 = fully visible, 0.0 = hidden.",
            inputSchema={
                "type": "object",
                "properties": {
                    "part_id": {
                        "type": "string",
                        "description": "Part ID as defined in the model (e.g., 'PartAccessory', 'PartHat', 'PartClothes')"
                    },
                    "value": {
                        "type": "number",
                        "description": "Opacity from 0.0 (hidden) to 1.0 (fully visible)",
                        "minimum": 0.0,
                        "maximum": 1.0
                    }
                },
                "required": ["part_id", "value"]
            }
        ),
        Tool(
            name="set_parts",
            description="Control the visibility/opacity of multiple model parts at once (clothing, accessories, etc.).",
            inputSchema={
                "type": "object",
                "properties": {
                    "parts": {
                        "type": "array",
                        "description": "List of part objects to update simultaneously",
                        "items": {
                            "type": "object",
                            "properties": {
                                "part_id": {"type": "string", "description": "Part ID"},
                                "value": {"type": "number", "description": "Opacity 0.0 to 1.0"}
                            },
                            "required": ["part_id", "value"]
                        }
                    }
                },
                "required": ["parts"]
            }
        ),
        Tool(
            name="set_focus",
            description="Set the character's focus/gaze direction using the native focus system. Overrides mouse tracking. Coordinates are normalized -1.0 to 1.0.",
            inputSchema={
                "type": "object",
                "properties": {
                    "x": {
                        "type": "number",
                        "description": "Horizontal focus: -1.0 (left) to 1.0 (right)",
                        "minimum": -1.0,
                        "maximum": 1.0
                    },
                    "y": {
                        "type": "number",
                        "description": "Vertical focus: -1.0 (down) to 1.0 (up)",
                        "minimum": -1.0,
                        "maximum": 1.0
                    }
                },
                "required": ["x", "y"]
            }
        ),
        Tool(
            name="load_model",
            description="Load a different model into the display. The model must already exist in the Hime Display model database.",
            inputSchema={
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Name of the model to load as it appears in the Hime Display database"
                    }
                },
                "required": ["model_name"]
            }
        ),
        Tool(
            name="get_model_info",
            description="Query the current model's state and available parameters, expressions, and motions. Use this to discover what controls are available for the loaded model.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="mdl_play_sequence",
            description="Play an animation sequence on a Source Engine (MDL) model. Use sequenceName (e.g., 'idle', 'walk', 'run', 'attack') or sequenceIndex.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sequence_name": {
                        "type": "string",
                        "description": "Animation sequence name (e.g., 'idle', 'walk', 'run', 'attack', 'reload')"
                    },
                    "sequence_index": {
                        "type": "integer",
                        "description": "Animation sequence index (use instead of name if name is unknown)",
                        "minimum": 0
                    }
                }
            }
        ),
        Tool(
            name="mdl_stop_sequence",
            description="Stop the currently playing animation sequence on a Source Engine (MDL) model.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="mdl_set_bodygroup",
            description="Set a bodygroup value on a Source Engine (MDL) model to switch between mesh variants (e.g., different weapons, clothing options).",
            inputSchema={
                "type": "object",
                "properties": {
                    "bodygroup_index": {
                        "type": "integer",
                        "description": "Index of the bodygroup to change",
                        "minimum": 0
                    },
                    "value": {
                        "type": "integer",
                        "description": "Value/variant to set for this bodygroup (0 = default)",
                        "minimum": 0
                    }
                },
                "required": ["bodygroup_index", "value"]
            }
        ),
        Tool(
            name="mdl_set_skin",
            description="Set the skin/texture variant on a Source Engine (MDL) model.",
            inputSchema={
                "type": "object",
                "properties": {
                    "skin_index": {
                        "type": "integer",
                        "description": "Index of the skin/texture variant to apply (0 = default)",
                        "minimum": 0
                    }
                },
                "required": ["skin_index"]
            }
        ),
        Tool(
            name="mdl_set_sequence_speed",
            description="Set the playback speed multiplier for animation sequences on a Source Engine (MDL) model.",
            inputSchema={
                "type": "object",
                "properties": {
                    "speed": {
                        "type": "number",
                        "description": "Speed multiplier: 1.0 = normal, 0.5 = half speed, 2.0 = double speed",
                        "minimum": 0.1,
                        "maximum": 10.0
                    }
                },
                "required": ["speed"]
            }
        ),
        Tool(
            name="mdl_set_sequence_loop",
            description="Set whether the current animation sequence loops on a Source Engine (MDL) model.",
            inputSchema={
                "type": "object",
                "properties": {
                    "loop": {
                        "type": "boolean",
                        "description": "True to loop the animation, false to play once"
                    }
                },
                "required": ["loop"]
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> Sequence[TextContent | EmbeddedResource]:
    """Handle tool execution requests"""
    
    try:
        if name == "set_emotion":
            emotion = arguments["emotion"]
            
            # Emotion parameter presets
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
                    {"parameterId": "ParamBrowLY", "value": -0.5},
                    {"parameterId": "ParamBrowRY", "value": -0.5},
                ],
                "confused": [
                    {"parameterId": "ParamMouthForm", "value": 0.2},
                    {"parameterId": "ParamAngleX", "value": 10},
                    {"parameterId": "ParamAngleY", "value": -3},
                ],
                "neutral": [
                    {"parameterId": "ParamMouthForm", "value": 0.0},
                    {"parameterId": "ParamEyeLOpen", "value": 1.0},
                    {"parameterId": "ParamEyeROpen", "value": 1.0},
                    {"parameterId": "ParamAngleX", "value": 0},
                    {"parameterId": "ParamAngleY", "value": 0},
                ],
                "worried": [
                    {"parameterId": "ParamMouthForm", "value": -0.3},
                    {"parameterId": "ParamEyeLOpen", "value": 0.8},
                    {"parameterId": "ParamEyeROpen", "value": 0.8},
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
            
            await display.send_command("setParameters", {
                "parameters": emotions.get(emotion, emotions["neutral"])
            })
            
            return [TextContent(
                type="text",
                text=f"✓ Set character emotion to '{emotion}'"
            )]
        
        elif name == "play_animation":
            group = arguments["group"]
            random = arguments.get("random", True)
            
            if random:
                await display.send_command("playRandomMotion", {"group": group})
                return [TextContent(
                    type="text",
                    text=f"✓ Playing random animation from '{group}' group"
                )]
            else:
                await display.send_command("playMotion", {
                    "group": group,
                    "index": 0
                })
                return [TextContent(
                    type="text",
                    text=f"✓ Playing animation from '{group}' group"
                )]
        
        elif name == "set_parameter":
            parameter_id = arguments["parameter_id"]
            value = arguments["value"]
            
            await display.send_command("setParameter", {
                "parameterId": parameter_id,
                "value": value
            })
            
            return [TextContent(
                type="text",
                text=f"✓ Set parameter '{parameter_id}' to {value}"
            )]
        
        elif name == "speak":
            duration = arguments.get("duration", 1.0)
            intensity = arguments.get("intensity", 0.7)
            
            # Disable auto breath during speech
            await display.send_command("setAutoBreath", {"enabled": False})
            
            # Animate mouth opening/closing
            frames = int(duration * 10)  # 10 frames per second
            for i in range(frames):
                # Create a talking pattern
                value = intensity * abs((i % 4) - 2) / 2
                await display.send_command("setParameter", {
                    "parameterId": "ParamMouthOpenY",
                    "value": value
                })
                await asyncio.sleep(0.1)
            
            # Close mouth
            await display.send_command("setParameter", {
                "parameterId": "ParamMouthOpenY",
                "value": 0.0
            })
            
            # Re-enable auto breath
            await display.send_command("setAutoBreath", {"enabled": True})
            
            return [TextContent(
                type="text",
                text=f"✓ Animated speaking for {duration} seconds"
            )]
        
        elif name == "look_at":
            x = arguments["x"]
            y = arguments["y"]
            
            # Map gaze direction to multiple parameters for natural look
            await display.send_command("setParameters", {
                "parameters": [
                    {"parameterId": "ParamEyeBallX", "value": x},
                    {"parameterId": "ParamEyeBallY", "value": y},
                    {"parameterId": "ParamAngleX", "value": x * 15},
                    {"parameterId": "ParamAngleY", "value": y * 10},
                    {"parameterId": "ParamBodyAngleX", "value": x * 5},
                ]
            })
            
            direction = "center"
            if abs(x) > 0.5:
                direction = "left" if x < 0 else "right"
            if abs(y) > 0.5:
                direction = f"{direction} and {'up' if y > 0 else 'down'}"
            
            return [TextContent(
                type="text",
                text=f"✓ Character looking {direction} (x={x}, y={y})"
            )]
        
        elif name == "control_auto_features":
            results = []
            
            if "breath" in arguments:
                await display.send_command("setAutoBreath", {
                    "enabled": arguments["breath"]
                })
                results.append(f"breathing: {'on' if arguments['breath'] else 'off'}")
            
            if "eye_blink" in arguments:
                await display.send_command("setAutoEyeBlink", {
                    "enabled": arguments["eye_blink"]
                })
                results.append(f"blinking: {'on' if arguments['eye_blink'] else 'off'}")
            
            if "track_mouse" in arguments:
                await display.send_command("setTrackMouse", {
                    "enabled": arguments["track_mouse"]
                })
                results.append(f"mouse tracking: {'on' if arguments['track_mouse'] else 'off'}")
            
            return [TextContent(
                type="text",
                text=f"✓ Updated auto features - {', '.join(results)}"
            )]
        
        elif name == "window_control":
            action = arguments["action"]
            
            if action == "show":
                await display.send_command("showDisplay", {})
                return [TextContent(type="text", text="✓ Display window shown")]
            else:
                await display.send_command("hideDisplay", {})
                return [TextContent(type="text", text="✓ Display window hidden")]

        elif name == "stop_animation":
            await display.send_command("stopMotion", {})
            return [TextContent(type="text", text="✓ Animation stopped")]

        elif name == "set_expression":
            expression = arguments["expression"]
            await display.send_command("setExpression", {"expression": expression})
            return [TextContent(type="text", text=f"✓ Set expression to '{expression}'")]

        elif name == "set_parameters":
            params = arguments["parameters"]
            await display.send_command("setParameters", {
                "parameters": [
                    {"parameterId": p["parameter_id"], "value": p["value"]}
                    for p in params
                ]
            })
            return [TextContent(type="text", text=f"✓ Set {len(params)} parameters")]

        elif name == "set_part":
            part_id = arguments["part_id"]
            value = arguments["value"]
            await display.send_command("setPart", {"partId": part_id, "value": value})
            return [TextContent(type="text", text=f"✓ Set part '{part_id}' to {value}")]

        elif name == "set_parts":
            parts = arguments["parts"]
            await display.send_command("setParts", {
                "parts": [
                    {"partId": p["part_id"], "value": p["value"]}
                    for p in parts
                ]
            })
            return [TextContent(type="text", text=f"✓ Set {len(parts)} parts")]

        elif name == "set_focus":
            x = arguments["x"]
            y = arguments["y"]
            await display.send_command("setFocus", {"x": x, "y": y})
            return [TextContent(type="text", text=f"✓ Focus set to ({x}, {y})")]

        elif name == "load_model":
            model_name = arguments["model_name"]
            await display.send_command("loadModel", {"name": model_name})
            return [TextContent(type="text", text=f"✓ Loading model '{model_name}'")]

        elif name == "get_model_info":
            result = await display.send_command("getModelInfo", {})
            return [TextContent(type="text", text=f"Model info: {json.dumps(result, indent=2)}")]

        elif name == "mdl_play_sequence":
            data = {}
            if "sequence_name" in arguments:
                data["sequenceName"] = arguments["sequence_name"]
            if "sequence_index" in arguments:
                data["sequenceIndex"] = arguments["sequence_index"]
            if not data:
                return [TextContent(type="text", text="✗ Provide sequence_name or sequence_index")]
            await display.send_command("playSequence", data)
            label = arguments.get("sequence_name") or arguments.get("sequence_index")
            return [TextContent(type="text", text=f"✓ Playing MDL sequence '{label}'")]

        elif name == "mdl_stop_sequence":
            await display.send_command("stopSequence", {})
            return [TextContent(type="text", text="✓ MDL sequence stopped")]

        elif name == "mdl_set_bodygroup":
            await display.send_command("setBodyGroup", {
                "bodyGroupIndex": arguments["bodygroup_index"],
                "value": arguments["value"]
            })
            return [TextContent(
                type="text",
                text=f"✓ Set MDL bodygroup {arguments['bodygroup_index']} to {arguments['value']}"
            )]

        elif name == "mdl_set_skin":
            await display.send_command("setSkin", {"skinIndex": arguments["skin_index"]})
            return [TextContent(type="text", text=f"✓ Set MDL skin to index {arguments['skin_index']}")]

        elif name == "mdl_set_sequence_speed":
            await display.send_command("setSequenceSpeed", {"speed": arguments["speed"]})
            return [TextContent(type="text", text=f"✓ Set MDL sequence speed to {arguments['speed']}x")]

        elif name == "mdl_set_sequence_loop":
            await display.send_command("setSequenceLoop", {"loop": arguments["loop"]})
            state = "looping" if arguments["loop"] else "one-shot"
            return [TextContent(type="text", text=f"✓ MDL sequence set to {state}")]

        else:
            return [TextContent(
                type="text",
                text=f"✗ Unknown tool: {name}"
            )]
    
    except ConnectionError as e:
        return [TextContent(
            type="text",
            text=f"✗ Connection error: {str(e)}. Make sure Hime Display is running with API enabled."
        )]
    except Exception as e:
        return [TextContent(
            type="text",
            text=f"✗ Error executing {name}: {str(e)}"
        )]


async def main():
    """Start the MCP server"""
    from mcp.server.stdio import stdio_server
    
    print("[Hime Display MCP Server]", file=sys.stderr)
    print(f"Connecting to Hime Display at {HIME_DISPLAY_WS}...", file=sys.stderr)
    
    # Try to connect to Hime Display
    if await display.connect():
        print("✓ Connected to Hime Display successfully", file=sys.stderr)
    else:
        print("✗ Failed to connect to Hime Display", file=sys.stderr)
        print("  Make sure:", file=sys.stderr)
        print("  1. Hime Display is running", file=sys.stderr)
        print("  2. API is enabled in settings", file=sys.stderr)
        print("  3. Ports match your configuration", file=sys.stderr)
        print("", file=sys.stderr)
        print("The server will continue and retry connections on demand.", file=sys.stderr)
    
    try:
        # Run MCP server
        async with stdio_server() as (read_stream, write_stream):
            print("✓ MCP server started and ready", file=sys.stderr)
            await app.run(
                read_stream,
                write_stream,
                app.create_initialization_options()
            )
    finally:
        await display.close()
        print("Server stopped", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
