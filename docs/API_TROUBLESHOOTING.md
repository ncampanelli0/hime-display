# API Troubleshooting Guide

## Common Issues and Solutions

### Connection Issues

#### Cannot Connect to WebSocket

**Symptoms:**
- `Connection refused`
- `ECONNREFUSED`
- Client timeout

**Solutions:**
1. **Check if Hime Display is running**
   ```bash
   # Check if process is running
   # Windows
   tasklist | findstr "hime-display"
   
   # macOS/Linux
   ps aux | grep hime-display
   ```

2. **Verify API is enabled**
   - Check console output for `[API Server] WebSocket listening on port 8765`
   - Check config file has `"api": { "enabled": true }`

3. **Verify port is correct**
   - Default: 8765 for WebSocket, 8766 for HTTP
   - Check config file if you changed it

4. **Check firewall**
   - Temporarily disable firewall to test
   - Add exception for the ports if needed

5. **Port conflict**
   ```bash
   # Windows - check what's using the port
   netstat -ano | findstr :8765
   
   # macOS/Linux
   lsof -i :8765
   ```
   If another app is using it, either stop that app or change Hime Display's port

#### HTTP Requests Failing

**Symptoms:**
- `404 Not Found`
- `Connection refused`
- No response

**Solutions:**
1. **Use correct endpoint**
   - POST requests: `http://localhost:8766`
   - Health check (GET): `http://localhost:8766/health`

2. **Verify Content-Type header**
   ```bash
   curl -X POST http://localhost:8766 \
     -H "Content-Type: application/json" \
     -d '{"action":"showDisplay","data":{}}'
   ```

3. **Check JSON format**
   - Must have `action` field
   - Must be valid JSON
   - Use a JSON validator if unsure

### Command Issues

#### Commands Not Working

**Symptoms:**
- Command sent but model doesn't respond
- No error message
- Acknowledgment received but no change

**Solutions:**
1. **Check if display window is open**
   ```json
   {"action":"showDisplay","data":{}}
   ```

2. **Verify model is loaded**
   - Open control panel
   - Check if a model is loaded in the display window
   - Load a model manually first

3. **Check parameter names**
   - Parameter IDs are case-sensitive
   - Common parameters: `ParamAngleX`, `ParamMouthOpenY`, `ParamEyeLOpen`
   - Not all models have all parameters
   - Use control panel to see available parameters

4. **Check parameter values**
   - Values must be within valid range
   - Common ranges: 0-1 for openness, -30 to 30 for angles
   - Invalid values may be clamped or ignored

5. **Disable automatic features**
   ```json
   {"action":"setAutoBreath","data":{"enabled":false}}
   {"action":"setAutoEyeBlink","data":{"enabled":false}}
   {"action":"setTrackMouse","data":{"enabled":false}}
   ```
   These can override your manual control

#### Motion Not Playing

**Symptoms:**
- `playMotion` command doesn't work
- Model doesn't animate

**Solutions:**
1. **Check motion group name**
   - Group names are case-sensitive
   - Common groups: `idle`, `motion`, `tap`, `greeting`
   - Use control panel to see available motion groups

2. **Try random motion first**
   ```json
   {"action":"playRandomMotion","data":{"group":"idle"}}
   ```

3. **Check model format**
   - Cubism 2 uses `File` (capital F)
   - Cubism 3/4 uses `file` (lowercase f)
   ```json
   // Cubism 2
   {"action":"playMotion","data":{"group":"idle","File":"idle_01.mtn"}}
   
   // Cubism 3/4
   {"action":"playMotion","data":{"group":"idle","file":"idle_01.motion3.json"}}
   ```

### Integration Issues

#### Python Client Issues

**Import Error:**
```
ModuleNotFoundError: No module named 'websockets'
```
**Solution:**
```bash
pip install websockets
```

**Connection Hanging:**
- Check if you're using `await` with async functions
- Ensure you're running in an async context
- Use `asyncio.run()` for top-level execution

#### Node.js Client Issues

**Module Not Found:**
```
Cannot find module 'ws'
```
**Solution:**
```bash
npm install ws
```

**WebSocket Closed Immediately:**
- Check for errors in event handlers
- Ensure server is running before connecting
- Add error handling to all events

#### MCP Server Issues

**Import Error:**
```
Import "mcp.server" could not be resolved
```
**Solution:**
```bash
pip install mcp
```

**Tools Not Appearing:**
- Check server is running: `python mcp_server.py`
- Verify client configuration points to correct server
- Check server logs for errors

### Performance Issues

#### High CPU Usage

**Causes:**
- Sending too many commands too quickly
- Rapid parameter updates

**Solutions:**
1. **Rate limit your commands**
   ```python
   # Add delay between commands
   await asyncio.sleep(0.1)
   ```

2. **Batch parameter updates**
   ```json
   // Instead of multiple setParameter calls
   {"action":"setParameters","data":{"parameters":[
     {"parameterId":"ParamAngleX","value":10},
     {"parameterId":"ParamAngleY","value":5}
   ]}}
   ```

3. **Use motion system instead of manual animation**
   ```json
   // Better than updating parameters 60 times per second
   {"action":"playMotion","data":{"group":"idle"}}
   ```

#### Lag or Delay

**Solutions:**
1. **Use WebSocket instead of HTTP**
   - Lower latency
   - Persistent connection
   - Less overhead

2. **Disable unnecessary features**
   - Turn off capture if not using camera
   - Disable auto features you're controlling manually

3. **Reduce update frequency**
   - 10-30 updates per second is usually enough
   - Don't update parameters that haven't changed

### Debugging

#### Enable Verbose Logging

Check the main process console for API logs:
- `[API Server] WebSocket client connected`
- `[API Server] Received message`
- `[Command Handler] Processing action`

#### Test with Curl

Always test with curl first before debugging client code:
```bash
# Test connection
curl http://localhost:8766/health

# Test command
curl -X POST http://localhost:8766 \
  -H "Content-Type: application/json" \
  -d '{"action":"showDisplay","data":{}}'
```

#### Use DevTools

Open developer tools in Hime Display:
- Control Panel → Settings → Open DevTools
- Check console for errors
- Monitor network tab for IPC messages

#### WebSocket Testing Tools

- **websocat** (CLI): `websocat ws://localhost:8765`
- **Postman** (GUI): Supports WebSocket testing
- **Browser console**: Built-in WebSocket API

```javascript
// In browser console
const ws = new WebSocket('ws://localhost:8765');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.send(JSON.stringify({action:'showDisplay',data:{}}));
```

## Error Messages

### `Display window is not open`

**Cause:** Trying to control model when display window isn't open

**Solution:**
```json
{"action":"showDisplay","data":{}}
```

### `parameterId and value are required`

**Cause:** Missing required fields in setParameter

**Solution:**
```json
{"action":"setParameter","data":{
  "parameterId":"ParamMouthOpenY",
  "value":0.8
}}
```

### `Unknown action: xyz`

**Cause:** Typo in action name or unsupported action

**Solution:** Check spelling against API documentation. Available actions:
- setParameter, setParameters
- playMotion, playRandomMotion
- setAutoBreath, setAutoEyeBlink, setTrackMouse
- setPart, setParts
- showDisplay, hideDisplay

### `Invalid JSON format`

**Cause:** Malformed JSON

**Solution:**
- Use JSON validator: https://jsonlint.com/
- Check for missing commas, quotes, brackets
- Ensure proper escaping

## Still Having Issues?

1. **Check the documentation**
   - [Quick Start](./API_QUICKSTART.md)
   - [Full API Reference](./API.md)
   - [Configuration Guide](./API_CONFIGURATION.md)

2. **Review examples**
   - [Python Client](../examples/python_client.py)
   - [Node.js Client](../examples/node_client.js)
   - [MCP Server](../examples/mcp_server/mcp_server.py)

3. **Search existing issues**
   - Check GitHub issues for similar problems

4. **Open a new issue**
   - Describe the problem clearly
   - Include error messages
   - Show your code/commands
   - Mention your OS and Hime Display version
   - Include console logs if possible

## Diagnostic Checklist

Before reporting an issue, verify:

- [ ] Hime Display is running
- [ ] API server is started (check console logs)
- [ ] Display window is open and model is loaded
- [ ] Port numbers are correct (8765 WS, 8766 HTTP)
- [ ] Firewall isn't blocking connections
- [ ] JSON syntax is valid
- [ ] Command format matches documentation
- [ ] Parameter names match your model
- [ ] Tried with curl/simple test first
- [ ] Checked console logs for errors
- [ ] Auto features disabled if taking manual control

## Tips for Smooth Integration

1. **Start simple** - Test with curl before building complex clients
2. **Use examples** - Modify the provided Python/Node.js examples
3. **Handle errors** - Always add error handling to your code
4. **Test incrementally** - Test each feature one at a time
5. **Read logs** - Console output provides valuable debugging info
6. **Stay updated** - Check for Hime Display updates
7. **Ask for help** - Community and maintainers are here to help!
