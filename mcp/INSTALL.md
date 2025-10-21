# Installation Guide - Hime Display MCP Server for LM Studio

This guide will walk you through setting up the MCP server to control Hime Display from LM Studio.

## Prerequisites

Before you begin, ensure you have:

- ✅ **Hime Display** installed and working
- ✅ **Python 3.8 or higher** (for Python server)
- ✅ **Node.js 18 or higher** (for JavaScript server, optional)
- ✅ **LM Studio** installed on your system

## Step 1: Install Python Dependencies

Open PowerShell or Command Prompt and run:

```powershell
pip install mcp websockets aiohttp
```

Or install from the requirements file:

```powershell
cd E:\programmingfiles\javascript\himedisplay\hime-display\mcp
pip install -r requirements.txt
```

### Verify Installation

Check that the packages are installed:

```powershell
python -c "import mcp, websockets, aiohttp; print('All dependencies installed!')"
```

## Step 2: Configure Hime Display

1. **Launch Hime Display**
2. **Open Settings/Control Panel**
3. **Enable API**:
   - Look for "API" or "External Control" section
   - Enable the API server
   - Note the ports (default: WebSocket 8765, HTTP 8766)
   - Save settings

4. **Load a Model**:
   - Make sure you have a Live2D model loaded
   - The display window should be visible

## Step 3: Test the Connection

Test that the server can connect to Hime Display:

```powershell
# Navigate to the mcp folder
cd E:\programmingfiles\javascript\himedisplay\hime-display\mcp

# Run the server manually
python server.py
```

You should see:
```
[Hime Display MCP Server]
Connecting to Hime Display at ws://localhost:8765...
✓ Connected to Hime Display successfully
✓ MCP server started and ready
```

If you see connection errors, go to the [Troubleshooting](#troubleshooting) section.

Press `Ctrl+C` to stop the test.

## Step 4: Configure LM Studio

### Method 1: Using LM Studio Settings UI (Recommended)

1. **Open LM Studio**
2. **Go to Settings**:
   - Click the gear icon (⚙️) in the bottom left
   - Navigate to **"Integrations"** or **"MCP"** tab
3. **Add MCP Server**:
   - Click **"Add Server"** or **"+ Add"**
   - Choose **"Custom Server"** or **"Local Server"**
4. **Configure the Server**:
   - **Server Name**: `hime-display`
   - **Command**: `python`
   - **Arguments**: `E:\programmingfiles\javascript\himedisplay\hime-display\mcp\server.py`
     - ⚠️ **Important**: Update this path to match your actual installation location!
   - **Environment Variables**: Leave empty (or add custom env vars if needed)
5. **Save and Enable**

### Method 2: Manual Configuration File

If LM Studio uses a configuration file (location varies by version):

**Windows**: `%APPDATA%\LM Studio\mcp-servers.json`  
**Alternative**: Check LM Studio documentation for the exact location

Add this configuration:

```json
{
  "mcpServers": {
    "hime-display": {
      "command": "python",
      "args": [
        "E:\\programmingfiles\\javascript\\himedisplay\\hime-display\\mcp\\server.py"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

**⚠️ Important**: 
- Replace `E:\\programmingfiles\\...` with your actual path
- Use double backslashes (`\\`) in JSON files
- Or use forward slashes: `E:/programmingfiles/...`

### Alternative: Node.js Server

If you prefer Node.js over Python:

1. **Install Node.js dependencies**:
```powershell
cd E:\programmingfiles\javascript\himedisplay\hime-display\mcp
npm install
```

2. **Configure LM Studio** to use:
   - **Command**: `node`
   - **Arguments**: `E:\programmingfiles\javascript\himedisplay\hime-display\mcp\server.js`

## Step 5: Verify LM Studio Integration

1. **Restart LM Studio** (if it was running)
2. **Load a Model** in LM Studio
3. **Start a Chat**
4. **Test the Integration**:

Try these prompts:

```
"Show the display window and make the character happy"
```

```
"Make the character wave hello"
```

```
"Make the character look to the left"
```

The AI should:
- ✅ Recognize the commands
- ✅ Use the MCP tools
- ✅ Control the Live2D character
- ✅ Provide feedback about the actions

## Step 6: Advanced Configuration

### Custom Ports

If you're using custom ports in Hime Display:

**Edit `server.py`:**
```python
HIME_DISPLAY_WS = "ws://localhost:YOUR_WS_PORT"
HIME_DISPLAY_HTTP = "http://localhost:YOUR_HTTP_PORT"
```

**Edit `server.js`:**
```javascript
const HIME_DISPLAY_WS = 'ws://localhost:YOUR_WS_PORT';
const HIME_DISPLAY_HTTP = 'http://localhost:YOUR_HTTP_PORT';
```

### Remote Connection

To connect to Hime Display on another machine:

```python
HIME_DISPLAY_WS = "ws://192.168.1.100:8765"  # Replace with target IP
```

**Note**: Ensure firewall allows connections on the ports.

### Environment Variables

You can use environment variables for configuration:

**In LM Studio config:**
```json
{
  "mcpServers": {
    "hime-display": {
      "command": "python",
      "args": ["E:\\path\\to\\server.py"],
      "env": {
        "HIME_WS_PORT": "8765",
        "HIME_HTTP_PORT": "8766"
      }
    }
  }
}
```

**In `server.py`:**
```python
import os
HIME_DISPLAY_WS = f"ws://localhost:{os.getenv('HIME_WS_PORT', '8765')}"
```

## Troubleshooting

### Issue: "Connection Refused" or "Failed to Connect"

**Causes:**
- Hime Display is not running
- API is not enabled in Hime Display settings
- Wrong port numbers

**Solutions:**
1. Verify Hime Display is running: Look for the tray icon
2. Check API settings in Hime Display control panel
3. Verify ports match in both applications
4. Check Windows Firewall settings

### Issue: "Python not found" or "Command not found"

**Causes:**
- Python is not installed
- Python is not in system PATH

**Solutions:**
1. Verify Python installation:
   ```powershell
   python --version
   ```
2. If not found, add Python to PATH or use full path:
   ```json
   "command": "C:\\Python311\\python.exe"
   ```

### Issue: "Module 'mcp' not found"

**Causes:**
- MCP package not installed
- Wrong Python environment

**Solutions:**
1. Install dependencies:
   ```powershell
   pip install mcp websockets aiohttp
   ```
2. If using virtual environment, activate it first
3. Check which Python LM Studio is using

### Issue: LM Studio Doesn't See the MCP Server

**Causes:**
- Configuration file in wrong location
- Incorrect JSON syntax
- Server disabled in settings

**Solutions:**
1. Check LM Studio documentation for config file location
2. Validate JSON syntax (use a JSON validator)
3. Restart LM Studio after config changes
4. Check LM Studio logs for errors

### Issue: Server Connects but Commands Don't Work

**Causes:**
- No model loaded in Hime Display
- Display window is closed
- Wrong parameter names for your model

**Solutions:**
1. Load a Live2D model in Hime Display
2. Make sure display window is visible
3. Check Hime Display logs for errors
4. Try basic commands first (window_control, set_emotion)

### Issue: "Port Already in Use"

**Causes:**
- Another instance of the server is running
- Another application is using the port

**Solutions:**
1. Close other instances:
   ```powershell
   # Find processes using the port
   netstat -ano | findstr :8765
   
   # Kill the process (replace PID with actual ID)
   taskkill /PID <PID> /F
   ```
2. Change the port in configuration

### Viewing Logs

**Hime Display Logs:**
- Check the application's log file (usually in AppData or Documents)

**MCP Server Logs:**
- Run manually to see output:
  ```powershell
  python server.py
  ```

**LM Studio Logs:**
- Check LM Studio's console or log files
- Usually in: `%APPDATA%\LM Studio\logs\`

## Next Steps

Now that installation is complete:

1. **Read the README.md** for usage examples and features
2. **Experiment with prompts** to see what the AI can do
3. **Customize emotions** by editing the emotion presets in `server.py`
4. **Create workflows** for your specific use case

## Getting Help

If you're still having issues:

1. Check the main [README.md](./README.md) for detailed documentation
2. Review the [Hime Display API documentation](../docs/API.md)
3. Check the GitHub issues for similar problems
4. Create a new issue with:
   - Your OS version
   - Python version
   - LM Studio version
   - Error messages and logs
   - Steps to reproduce

## Uninstalling

To remove the MCP server:

1. **Remove from LM Studio**:
   - Go to Settings → Integrations → MCP
   - Delete or disable the hime-display server

2. **Remove Python packages** (optional):
   ```powershell
   pip uninstall mcp websockets aiohttp
   ```

3. **Delete the mcp folder** (optional):
   ```powershell
   rmdir /s E:\programmingfiles\javascript\himedisplay\hime-display\mcp
   ```

---

**Congratulations!** 🎉 You've successfully set up the Hime Display MCP Server for LM Studio!
