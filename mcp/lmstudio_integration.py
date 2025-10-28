"""
LM Studio Integration with Auto-Animation
This script connects to LM Studio's API and adds automatic character animations
to responses, creating a Neuro-sama-style AI VTuber experience.

Usage:
1. Start Hime Display with a model loaded
2. Start LM Studio with a model loaded
3. Run this script: python lmstudio_integration.py
4. The character will automatically animate based on AI responses
"""

import asyncio
import json
import aiohttp
from adaptive_animation import SimpleBridge

# Configuration
LM_STUDIO_API = "http://localhost:41/v1"  # Default LM Studio API endpoint
HIME_DISPLAY_WS = "ws://localhost:8765"


class LMStudioClient:
    """Client for LM Studio API with streaming support"""
    
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.chat_endpoint = f"{api_url}/chat/completions"
        self.session = None
    
    async def create_session(self):
        """Create aiohttp session"""
        if not self.session:
            self.session = aiohttp.ClientSession()
    
    async def close(self):
        """Close session"""
        if self.session:
            await self.session.close()
    
    async def send_message(self, message: str, conversation_history: list = None) -> str:
        """Send message to LM Studio and get response"""
        await self.create_session()
        
        if conversation_history is None:
            conversation_history = []
        
        # Add user message to history
        messages = conversation_history + [{"role": "user", "content": message}]
        
        payload = {
            "model": "local-model",  # LM Studio uses this for loaded model
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 500,
            "stream": False
        }
        
        try:
            async with self.session.post(self.chat_endpoint, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    error_text = await response.text()
                    raise Exception(f"LM Studio API error: {error_text}")
        except Exception as e:
            raise Exception(f"Failed to connect to LM Studio: {e}")
    
    async def send_message_streaming(self, message: str, conversation_history: list = None):
        """Send message with streaming response (generator)"""
        await self.create_session()
        
        if conversation_history is None:
            conversation_history = []
        
        messages = conversation_history + [{"role": "user", "content": message}]
        
        payload = {
            "model": "local-model",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 500,
            "stream": True
        }
        
        try:
            async with self.session.post(self.chat_endpoint, json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"LM Studio API error: {error_text}")
                
                async for line in response.content:
                    line = line.decode('utf-8').strip()
                    if line.startswith('data: '):
                        line = line[6:]
                        if line == '[DONE]':
                            break
                        try:
                            data = json.loads(line)
                            if 'choices' in data and len(data['choices']) > 0:
                                delta = data['choices'][0].get('delta', {})
                                content = delta.get('content', '')
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise Exception(f"Streaming error: {e}")


class AnimatedChatbot:
    """Chatbot with automatic character animations"""
    
    def __init__(self):
        self.lm_client = LMStudioClient(LM_STUDIO_API)
        self.animation_bridge = SimpleBridge()
        self.conversation_history = []
        self.system_prompt = {
            "role": "system",
            "content": "You are a friendly and expressive AI assistant. You're cheerful, helpful, and show emotions through your responses. Use punctuation like ! and ? to express yourself."
        }
    
    async def initialize(self):
        """Initialize all components"""
        print("=" * 70)
        print("LM Studio + Hime Display")
        print("=" * 70)
        print("\nInitializing components...\n")
        
        # Initialize animation bridge
        if not await self.animation_bridge.initialize():
            print("\n⚠ Failed to initialize animation bridge")
            return False
        
        # Test LM Studio connection
        print("\nTesting LM Studio connection...")
        try:
            await self.lm_client.create_session()
            # Simple test request
            test_response = await self.lm_client.send_message("Hi", [self.system_prompt])
            print("✓ LM Studio connected")
        except Exception as e:
            print(f"✗ Failed to connect to LM Studio: {e}")
            print("\nMake sure:")
            print("  1. LM Studio is running")
            print("  2. A model is loaded")
            print("  3. Local server is started (default: http://localhost:41)")
            return False
        
        self.conversation_history = [self.system_prompt]
        
        print("\n" + "=" * 70)
        print("✓ All systems ready!")
        print("=" * 70)
        print("\nYou can now chat with the AI VTuber!")
        print("The character will automatically animate based on responses.")
        print("Type 'quit' or 'exit' to stop.\n")
        
        return True
    
    async def chat(self, user_message: str) -> str:
        """Process chat message with animations"""
        # Get AI response
        print("\n[Thinking...]")
        try:
            ai_response = await self.lm_client.send_message(
                user_message, 
                self.conversation_history
            )
        except Exception as e:
            print(f"Error getting AI response: {e}")
            return None
        
        # Update conversation history
        self.conversation_history.append({"role": "user", "content": user_message})
        self.conversation_history.append({"role": "assistant", "content": ai_response})
        
        # Keep history reasonable size
        if len(self.conversation_history) > 20:
            self.conversation_history = [self.system_prompt] + self.conversation_history[-18:]
        
        # Animate character speaking (adaptive version handles detection)
        await self.animation_bridge.on_ai_response(ai_response)
        
        return ai_response
    
    async def run_interactive(self):
        """Run interactive chat loop"""
        if not await self.initialize():
            return
        
        try:
            while True:
                # Get user input
                user_input = input("\n[You] ")
                
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    print("\nGoodbye! 👋")
                    break
                
                if not user_input.strip():
                    continue
                
                # Process chat
                response = await self.chat(user_input)
                
                if response:
                    print(f"\n[AI] {response}")
        
        except KeyboardInterrupt:
            print("\n\nStopped by user")
        finally:
            await self.shutdown()
    
    async def shutdown(self):
        """Cleanup and shutdown"""
        print("\nShutting down...")
        await self.animation_bridge.shutdown()
        await self.lm_client.close()
        print("✓ Shutdown complete")


async def main():
    """Main entry point"""
    chatbot = AnimatedChatbot()
    await chatbot.run_interactive()


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("Starting LM Studio Integration with Auto-Animation...")
    print("=" * 70 + "\n")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nProgram terminated")
