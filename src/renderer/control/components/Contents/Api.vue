<template>
  <div class="hime-content">
    <el-scrollbar>
      <el-form class="hime-el-form--config" label-position="top">
        <!-- API Status -->
        <hime-title-with-divider>
          {{ $t("api.status") }}
        </hime-title-with-divider>

        <el-alert
          v-if="apiStatus.running"
          :title="$t('api.running')"
          type="success"
          :closable="false"
          show-icon
        >
          <template #default>
            <div style="margin-top: 8px">
              <div>WebSocket: <code>ws://localhost:{{ wsPort }}</code></div>
              <div>HTTP: <code>http://localhost:{{ httpPort }}</code></div>
            </div>
          </template>
        </el-alert>

        <el-alert
          v-else
          :title="$t('api.stopped')"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            {{ $t("api.enableToStart") }}
          </template>
        </el-alert>

        <!-- API Configuration -->
        <hime-title-with-divider>
          {{ $t("api.configuration") }}
        </hime-title-with-divider>

        <el-form-item :label="$t('api.enableApi')">
          <el-switch
            v-model="apiEnabled"
            @change="handleConfigChange"
          ></el-switch>
          <el-text type="info" size="small" style="margin-top: 4px">
            {{ $t("api.enableApiDesc") }}
          </el-text>
        </el-form-item>

        <el-form-item :label="$t('api.wsPort')">
          <el-input-number
            v-model="wsPort"
            :min="1024"
            :max="65535"
            @change="handleConfigChange"
            :disabled="apiStatus.running"
          ></el-input-number>
          <el-text type="info" size="small" style="margin-top: 4px">
            {{ $t("api.wsPortDesc") }}
          </el-text>
          <el-text v-if="apiStatus.running" type="warning" size="small" style="margin-top: 4px">
            {{ $t("api.restartRequired") }}
          </el-text>
        </el-form-item>

        <el-form-item :label="$t('api.httpPort')">
          <el-input-number
            v-model="httpPort"
            :min="1024"
            :max="65535"
            @change="handleConfigChange"
            :disabled="apiStatus.running"
          ></el-input-number>
          <el-text type="info" size="small" style="margin-top: 4px">
            {{ $t("api.httpPortDesc") }}
          </el-text>
          <el-text v-if="apiStatus.running" type="warning" size="small" style="margin-top: 4px">
            {{ $t("api.restartRequired") }}
          </el-text>
        </el-form-item>

        <!-- Quick Actions -->
        <hime-title-with-divider>
          {{ $t("api.quickActions") }}
        </hime-title-with-divider>

        <el-form-item>
          <el-space direction="vertical" style="width: 100%">
            <el-button
              type="primary"
              @click="testConnection"
              :loading="testing"
            >
              {{ $t("api.testConnection") }}
            </el-button>
            
            <el-button @click="copyEndpoint('ws')">
              {{ $t("api.copyWebSocketUrl") }}
            </el-button>
            
            <el-button @click="copyEndpoint('http')">
              {{ $t("api.copyHttpUrl") }}
            </el-button>

            <el-button @click="openDocs">
              {{ $t("api.openDocumentation") }}
            </el-button>
          </el-space>
        </el-form-item>

        <!-- Available Endpoints -->
        <hime-title-with-divider>
          {{ $t("api.availableEndpoints") }}
        </hime-title-with-divider>

        <el-collapse>
          <el-collapse-item :title="$t('api.modelControl')" name="1">
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in modelControlEndpoints" :key="endpoint.action">
                <code>{{ endpoint.action }}</code>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item :title="$t('api.animations')" name="2">
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in animationEndpoints" :key="endpoint.action">
                <code>{{ endpoint.action }}</code>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item :title="$t('api.autoFeatures')" name="3">
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in autoFeatureEndpoints" :key="endpoint.action">
                <code>{{ endpoint.action }}</code>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item :title="$t('api.windowControl')" name="4">
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in windowEndpoints" :key="endpoint.action">
                <code>{{ endpoint.action }}</code>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <!-- Example Code -->
        <hime-title-with-divider>
          {{ $t("api.exampleCode") }}
        </hime-title-with-divider>

        <el-tabs type="border-card">
          <el-tab-pane label="curl">
            <pre class="code-block">{{ curlExample }}</pre>
            <el-button size="small" @click="copyCode(curlExample)">
              {{ $t("api.copyCode") }}
            </el-button>
          </el-tab-pane>
          
          <el-tab-pane label="Python">
            <pre class="code-block">{{ pythonExample }}</pre>
            <el-button size="small" @click="copyCode(pythonExample)">
              {{ $t("api.copyCode") }}
            </el-button>
          </el-tab-pane>
          
          <el-tab-pane label="JavaScript">
            <pre class="code-block">{{ jsExample }}</pre>
            <el-button size="small" @click="copyCode(jsExample)">
              {{ $t("api.copyCode") }}
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useTranslation } from "i18next-vue";
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { useAppStore } from "@control/store/app";

const { t } = useTranslation();
const appStore = useAppStore();

// Use local refs with default values to prevent undefined errors
const apiEnabled = ref(false);
const wsPort = ref(8765);
const httpPort = ref(8766);

const apiStatus = reactive({
  running: false,
});

const testing = ref(false);

// Initialize values from config when available
onMounted(() => {
  if (appStore.config.api) {
    apiEnabled.value = appStore.config.api.enabled ?? true;
    wsPort.value = appStore.config.api.wsPort ?? 8765;
    httpPort.value = appStore.config.api.httpPort ?? 8766;
  }
  checkApiStatus();
});

const modelControlEndpoints = [
  { action: "setParameter", description: t("api.endpoints.setParameter") },
  { action: "setParameters", description: t("api.endpoints.setParameters") },
  { action: "setPart", description: t("api.endpoints.setPart") },
  { action: "setParts", description: t("api.endpoints.setParts") },
];

const animationEndpoints = [
  { action: "playMotion", description: t("api.endpoints.playMotion") },
  { action: "playRandomMotion", description: t("api.endpoints.playRandomMotion") },
];

const autoFeatureEndpoints = [
  { action: "setAutoBreath", description: t("api.endpoints.setAutoBreath") },
  { action: "setAutoEyeBlink", description: t("api.endpoints.setAutoEyeBlink") },
  { action: "setTrackMouse", description: t("api.endpoints.setTrackMouse") },
];

const windowEndpoints = [
  { action: "showDisplay", description: t("api.endpoints.showDisplay") },
  { action: "hideDisplay", description: t("api.endpoints.hideDisplay") },
];

const curlExample = computed(() => {
  return `curl -X POST http://localhost:${httpPort.value} \\
  -H "Content-Type: application/json" \\
  -d '{"action":"setParameter","data":{"parameterId":"ParamMouthOpenY","value":0.8}}'`;
});

const pythonExample = computed(() => {
  return `import asyncio
import websockets
import json

async def control_model():
    async with websockets.connect("ws://localhost:${wsPort.value}") as ws:
        await ws.recv()  # Connection message
        
        command = {
            "action": "setParameter",
            "data": {
                "parameterId": "ParamMouthOpenY",
                "value": 0.8
            }
        }
        await ws.send(json.dumps(command))
        response = await ws.recv()
        print(response)

asyncio.run(control_model())`;
});

const jsExample = computed(() => {
  return `const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:${wsPort.value}');

ws.on('open', () => {
  const command = {
    action: 'setParameter',
    data: {
      parameterId: 'ParamMouthOpenY',
      value: 0.8
    }
  };
  ws.send(JSON.stringify(command));
});

ws.on('message', (data) => {
  console.log('Response:', data.toString());
});`;
});

async function checkApiStatus() {
  try {
    const response = await fetch(`http://localhost:${httpPort.value}/health`);
    apiStatus.running = response.ok;
  } catch (error) {
    apiStatus.running = false;
  }
}

function handleConfigChange() {
  // Ensure config.api exists
  if (!appStore.config.api) {
    appStore.config.api = {};
  }
  
  // Update the store
  appStore.config.api.enabled = apiEnabled.value;
  appStore.config.api.wsPort = wsPort.value;
  appStore.config.api.httpPort = httpPort.value;
  
  // Save to disk
  window.nodeAPI.config.write('api', appStore.config.api);
  
  if (!apiStatus.running) {
    checkApiStatus();
  }
}

async function testConnection() {
  testing.value = true;
  try {
    const response = await fetch(`http://localhost:${httpPort.value}/health`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      ElMessage.success(t("api.connectionSuccess"));
      apiStatus.running = true;
    } else {
      throw new Error("Connection failed");
    }
  } catch (error) {
    ElMessage.error(t("api.connectionFailed"));
    apiStatus.running = false;
  } finally {
    testing.value = false;
  }
}

function copyEndpoint(type) {
  const url = type === 'ws' 
    ? `ws://localhost:${wsPort.value}`
    : `http://localhost:${httpPort.value}`;
  
  navigator.clipboard.writeText(url);
  ElMessage.success(t("api.copiedToClipboard"));
}

function copyCode(code) {
  navigator.clipboard.writeText(code);
  ElMessage.success(t("api.copiedToClipboard"));
}

function openDocs() {
  window.nodeAPI.openLink("https://github.com/TSKI433/hime-display/blob/main/docs/API.md");
}
</script>

<style scoped lang="scss">
.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.endpoint-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;

  code {
    font-weight: bold;
    color: var(--el-color-primary);
  }
}

.code-block {
  background-color: var(--el-fill-color-darker);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 8px;
}

:deep(.el-collapse-item__content) {
  padding: 12px;
}

:deep(.el-tabs__content) {
  padding: 16px;
}
</style>
