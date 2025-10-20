# API Configuration Guide

## Default Configuration

The API server is enabled by default with these settings:

```json
{
  "api": {
    "enabled": true,
    "wsPort": 8765,
    "httpPort": 8766
  }
}
```

## Changing Configuration

### Option 1: Via Config File

1. Locate your config file (usually in your app data directory)
2. Add or modify the `api` section:

```json
{
  "general": { ... },
  "display": { ... },
  "api": {
    "enabled": true,
    "wsPort": 9000,
    "httpPort": 9001
  }
}
```

3. Restart Hime Display

### Option 2: Via Control Panel (Future Feature)

This will be added in a future update to allow GUI configuration.

## Port Selection

**WebSocket Port (default 8765):**
- Used for persistent connections
- Recommended for real-time AI control
- Provides bidirectional communication

**HTTP Port (default 8766):**
- Used for simple REST API calls
- Good for testing and simple integrations
- One-way communication

## Firewall Configuration

If you need to access the API from another machine:

**Windows:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → TCP
5. Add your ports (8765, 8766)
6. Allow the connection
7. Name the rule "Hime Display API"

**macOS:**
```bash
# Allow incoming connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/hime-display
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /path/to/hime-display
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Local Only by Default**: The API binds to all interfaces (0.0.0.0). If you only want local access, this is fine.

2. **No Authentication**: The current implementation has no authentication. Anyone who can reach your ports can control the model.

3. **For Production Use**: If you plan to expose this over the internet:
   - Use a reverse proxy (nginx, Caddy) with authentication
   - Implement rate limiting
   - Use HTTPS/WSS for encrypted connections
   - Consider adding authentication to the API code

4. **Network Exposure**: Only expose ports if you need remote access. For local AI development, default settings are fine.

## Testing Your Configuration

### Check if API is Running

**WebSocket:**
```bash
# Using websocat (install: cargo install websocat)
websocat ws://localhost:8765
```

**HTTP:**
```bash
curl http://localhost:8766/health
```

Expected response:
```json
{"status":"ok","timestamp":1234567890}
```

### Test from Another Machine

Replace `localhost` with your machine's IP address:

```python
# Python
client = HimeDisplayClient(host="192.168.1.100", port=8765)
```

```bash
# curl
curl http://192.168.1.100:8766/health
```

## Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE` or "Address already in use"

**Solution:**
1. Check what's using the port:
   ```bash
   # Windows
   netstat -ano | findstr :8765
   
   # macOS/Linux
   lsof -i :8765
   ```

2. Either:
   - Stop the other application
   - Change the port in your config

### Cannot Connect from Another Machine

**Check:**
1. Firewall is configured correctly
2. Both machines are on the same network
3. You're using the correct IP address (not localhost)
4. Ports aren't blocked by router/network policy

### API Not Starting

**Check console output:**
- Look for `[API Server] WebSocket listening on port XXXX`
- Look for `[API Server] HTTP listening on port XXXX`
- Check for error messages

**Common issues:**
- Port already in use
- Insufficient permissions
- Configuration syntax error

## Advanced: SSL/TLS Configuration

For secure connections over the internet, you'll want to use WSS (WebSocket Secure) and HTTPS.

### Using a Reverse Proxy (Recommended)

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # HTTP API
    location /api {
        proxy_pass http://localhost:8766;
        proxy_set_header Host $host;
    }
}
```

Then connect to:
- `wss://your-domain.com/ws`
- `https://your-domain.com/api`

## Environment Variables

You can also configure via environment variables (requires code modification):

```javascript
// In Application.js
const apiConfig = {
  enabled: process.env.HIME_API_ENABLED !== 'false',
  wsPort: parseInt(process.env.HIME_WS_PORT || '8765'),
  httpPort: parseInt(process.env.HIME_HTTP_PORT || '8766'),
};
```

Then set:
```bash
# Windows
set HIME_WS_PORT=9000
set HIME_HTTP_PORT=9001

# macOS/Linux
export HIME_WS_PORT=9000
export HIME_HTTP_PORT=9001
```

## Monitoring

### Log API Activity

Check the console/logs for:
- `[API Server] WebSocket client connected from X.X.X.X`
- `[API Server] Received message: {...}`
- `[Command Handler] Processing action: ...`

### Connection Count

In future updates, you'll be able to query the number of connected clients and their status.

## Need Help?

- Check the [Quick Start Guide](./API_QUICKSTART.md)
- Review [Example Implementations](../examples/)
- Open an issue on GitHub
