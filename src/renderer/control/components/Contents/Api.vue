<template>
  <div class="hime-content">
    <el-scrollbar>
      <el-form class="hime-el-form--config" label-position="top">
        
        <!-- Overview Section -->
        <hime-title-with-divider>
          {{ $t("api.overview.title") }}
        </hime-title-with-divider>

        <el-card class="info-card" shadow="never">
          <div class="info-section">
            <el-icon class="info-icon" :size="20"><InfoFilled /></el-icon>
            <div class="info-content">
              <p><strong>{{ $t("api.overview.whatIs") }}</strong></p>
              <p>{{ $t("api.overview.description") }}</p>
              
              <p style="margin-top: 12px"><strong>{{ $t("api.overview.protocols") }}</strong></p>
              <ul>
                <li><strong>WebSocket ({{ $t("api.overview.recommended") }}):</strong> {{ $t("api.overview.websocketDesc") }}</li>
                <li><strong>HTTP:</strong> {{ $t("api.overview.httpDesc") }}</li>
              </ul>

              <p style="margin-top: 12px"><strong>{{ $t("api.overview.useCases") }}</strong></p>
              <ul>
                <li>{{ $t("api.overview.useCase1") }}</li>
                <li>{{ $t("api.overview.useCase2") }}</li>
                <li>{{ $t("api.overview.useCase3") }}</li>
                <li>{{ $t("api.overview.useCase4") }}</li>
              </ul>
            </div>
          </div>
        </el-card>

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
              <div><strong>WebSocket:</strong> <code>ws://localhost:{{ wsPort }}</code></div>
              <div><strong>HTTP:</strong> <code>http://localhost:{{ httpPort }}</code></div>
              <div style="margin-top: 8px">
                <el-tag type="success" size="small">{{ $t("api.status.accepting") }}</el-tag>
              </div>
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

        <el-card class="config-card" shadow="never">
          <el-form-item :label="$t('api.enableApi')">
            <el-switch
              v-model="apiEnabled"
              @change="handleConfigChange"
            ></el-switch>
            <el-text type="info" size="small" style="margin-top: 4px; display: block">
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
            <el-text type="info" size="small" style="margin-top: 4px; display: block">
              {{ $t("api.wsPortDesc") }}
            </el-text>
            <el-text v-if="apiStatus.running" type="warning" size="small" style="margin-top: 4px; display: block">
              <el-icon><WarningFilled /></el-icon> {{ $t("api.restartRequired") }}
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
            <el-text type="info" size="small" style="margin-top: 4px; display: block">
              {{ $t("api.httpPortDesc") }}
            </el-text>
            <el-text v-if="apiStatus.running" type="warning" size="small" style="margin-top: 4px; display: block">
              <el-icon><WarningFilled /></el-icon> {{ $t("api.restartRequired") }}
            </el-text>
          </el-form-item>
        </el-card>

        <!-- Quick Actions -->
        <hime-title-with-divider>
          {{ $t("api.quickActions") }}
        </hime-title-with-divider>

        <el-space direction="vertical" style="width: 100%" :size="8">
          <el-button
            type="primary"
            @click="testConnection"
            :loading="testing"
            style="width: 100%"
          >
            <el-icon><Connection /></el-icon>
            {{ $t("api.testConnection") }}
          </el-button>
          
          <el-button @click="copyEndpoint('ws')" style="width: 100%">
            <el-icon><CopyDocument /></el-icon>
            {{ $t("api.copyWebSocketUrl") }}
          </el-button>
          
          <el-button @click="copyEndpoint('http')" style="width: 100%">
            <el-icon><CopyDocument /></el-icon>
            {{ $t("api.copyHttpUrl") }}
          </el-button>

          <el-button @click="openDocs" style="width: 100%">
            <el-icon><Document /></el-icon>
            {{ $t("api.openDocumentation") }}
          </el-button>
        </el-space>

        <!-- Getting Started Guide -->
        <hime-title-with-divider>
          {{ $t("api.gettingStarted.title") }}
        </hime-title-with-divider>

        <el-card class="guide-card" shadow="never">
          <el-steps direction="vertical" :active="4">
            <el-step :title="$t('api.gettingStarted.step1.title')">
              <template #description>
                <p>{{ $t("api.gettingStarted.step1.desc") }}</p>
              </template>
            </el-step>
            
            <el-step :title="$t('api.gettingStarted.step2.title')">
              <template #description>
                <p>{{ $t("api.gettingStarted.step2.desc") }}</p>
                <div class="code-inline">
                  <code>ws://localhost:{{ wsPort }}</code>
                  <span style="margin: 0 8px">{{ $t("api.gettingStarted.or") }}</span>
                  <code>http://localhost:{{ httpPort }}</code>
                </div>
              </template>
            </el-step>
            
            <el-step :title="$t('api.gettingStarted.step3.title')">
              <template #description>
                <p>{{ $t("api.gettingStarted.step3.desc") }}</p>
                <pre class="code-block-small">{{ quickStartExample }}</pre>
              </template>
            </el-step>
            
            <el-step :title="$t('api.gettingStarted.step4.title')">
              <template #description>
                <p>{{ $t("api.gettingStarted.step4.desc") }}</p>
              </template>
            </el-step>
          </el-steps>
        </el-card>

        <!-- Message Format Documentation -->
        <hime-title-with-divider>
          {{ $t("api.messageFormat.title") }}
        </hime-title-with-divider>

        <el-card class="format-card" shadow="never">
          <div class="format-section">
            <h4>{{ $t("api.messageFormat.request") }}</h4>
            <p>{{ $t("api.messageFormat.requestDesc") }}</p>
            <pre class="code-block-small">{{ messageFormatExample }}</pre>
            
            <el-divider />
            
            <h4>{{ $t("api.messageFormat.fields") }}</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item :label="$t('api.messageFormat.actionField')">
                {{ $t("api.messageFormat.actionDesc") }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('api.messageFormat.dataField')">
                {{ $t("api.messageFormat.dataDesc") }}
              </el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <h4>{{ $t("api.messageFormat.response") }}</h4>
            <p>{{ $t("api.messageFormat.responseDesc") }}</p>
            
            <el-collapse accordion style="margin-top: 12px">
              <el-collapse-item :title="$t('api.messageFormat.successResponse')" name="success">
                <pre class="code-block-small">{{ successResponseExample }}</pre>
              </el-collapse-item>
              <el-collapse-item :title="$t('api.messageFormat.errorResponse')" name="error">
                <pre class="code-block-small">{{ errorResponseExample }}</pre>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-card>

        <!-- Available Endpoints -->
        <hime-title-with-divider>
          {{ $t("api.availableEndpoints") }}
        </hime-title-with-divider>

        <el-collapse accordion>
          <el-collapse-item name="1">
            <template #title>
              <div class="collapse-title">
                <el-icon><Setting /></el-icon>
                <span>{{ $t("api.modelControl") }}</span>
                <el-tag size="small" style="margin-left: auto">4 {{ $t("api.endpoints.count") }}</el-tag>
              </div>
            </template>
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in modelControlEndpoints" :key="endpoint.action">
                <div class="endpoint-header">
                  <code class="endpoint-name">{{ endpoint.action }}</code>
                  <el-button size="small" text @click="copyCode(getEndpointExample(endpoint.action))">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
                <div v-if="endpoint.example" class="endpoint-example">
                  <pre class="code-block-small">{{ endpoint.example }}</pre>
                </div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item name="2">
            <template #title>
              <div class="collapse-title">
                <el-icon><VideoPlay /></el-icon>
                <span>{{ $t("api.animations") }}</span>
                <el-tag size="small" style="margin-left: auto">2 {{ $t("api.endpoints.count") }}</el-tag>
              </div>
            </template>
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in animationEndpoints" :key="endpoint.action">
                <div class="endpoint-header">
                  <code class="endpoint-name">{{ endpoint.action }}</code>
                  <el-button size="small" text @click="copyCode(getEndpointExample(endpoint.action))">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
                <div v-if="endpoint.example" class="endpoint-example">
                  <pre class="code-block-small">{{ endpoint.example }}</pre>
                </div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item name="3">
            <template #title>
              <div class="collapse-title">
                <el-icon><MagicStick /></el-icon>
                <span>{{ $t("api.autoFeatures") }}</span>
                <el-tag size="small" style="margin-left: auto">3 {{ $t("api.endpoints.count") }}</el-tag>
              </div>
            </template>
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in autoFeatureEndpoints" :key="endpoint.action">
                <div class="endpoint-header">
                  <code class="endpoint-name">{{ endpoint.action }}</code>
                  <el-button size="small" text @click="copyCode(getEndpointExample(endpoint.action))">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
                <div v-if="endpoint.example" class="endpoint-example">
                  <pre class="code-block-small">{{ endpoint.example }}</pre>
                </div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item name="4">
            <template #title>
              <div class="collapse-title">
                <el-icon><Monitor /></el-icon>
                <span>{{ $t("api.windowControl") }}</span>
                <el-tag size="small" style="margin-left: auto">2 {{ $t("api.endpoints.count") }}</el-tag>
              </div>
            </template>
            <div class="endpoint-list">
              <div class="endpoint-item" v-for="endpoint in windowEndpoints" :key="endpoint.action">
                <div class="endpoint-header">
                  <code class="endpoint-name">{{ endpoint.action }}</code>
                  <el-button size="small" text @click="copyCode(getEndpointExample(endpoint.action))">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
                <el-text type="info" size="small">{{ endpoint.description }}</el-text>
                <div v-if="endpoint.example" class="endpoint-example">
                  <pre class="code-block-small">{{ endpoint.example }}</pre>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <!-- Example Code -->
        <hime-title-with-divider>
          {{ $t("api.exampleCode") }}
        </hime-title-with-divider>

        <el-card class="example-card" shadow="never">
          <p>{{ $t("api.exampleCodeDesc") }}</p>
          
          <el-tabs type="border-card" style="margin-top: 16px">
            <el-tab-pane>
              <template #label>
                <span><el-icon><Document /></el-icon> curl</span>
              </template>
              <div class="code-container">
                <pre class="code-block">{{ curlExample }}</pre>
                <el-button size="small" @click="copyCode(curlExample)" style="margin-top: 8px">
                  <el-icon><CopyDocument /></el-icon>
                  {{ $t("api.copyCode") }}
                </el-button>
              </div>
            </el-tab-pane>
            
            <el-tab-pane>
              <template #label>
                <span><el-icon><Document /></el-icon> Python</span>
              </template>
              <div class="code-container">
                <pre class="code-block">{{ pythonExample }}</pre>
                <el-button size="small" @click="copyCode(pythonExample)" style="margin-top: 8px">
                  <el-icon><CopyDocument /></el-icon>
                  {{ $t("api.copyCode") }}
                </el-button>
              </div>
            </el-tab-pane>
            
            <el-tab-pane>
              <template #label>
                <span><el-icon><Document /></el-icon> JavaScript</span>
              </template>
              <div class="code-container">
                <pre class="code-block">{{ jsExample }}</pre>
                <el-button size="small" @click="copyCode(jsExample)" style="margin-top: 8px">
                  <el-icon><CopyDocument /></el-icon>
                  {{ $t("api.copyCode") }}
                </el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- Troubleshooting -->
        <hime-title-with-divider>
          {{ $t("api.troubleshooting.title") }}
        </hime-title-with-divider>

        <el-card class="troubleshooting-card" shadow="never">
          <el-collapse accordion>
            <el-collapse-item :title="$t('api.troubleshooting.cannotConnect')" name="connect">
              <ul>
                <li>{{ $t("api.troubleshooting.checkEnabled") }}</li>
                <li>{{ $t("api.troubleshooting.checkPorts") }}</li>
                <li>{{ $t("api.troubleshooting.checkFirewall") }}</li>
                <li>{{ $t("api.troubleshooting.restartApp") }}</li>
              </ul>
            </el-collapse-item>
            
            <el-collapse-item :title="$t('api.troubleshooting.commandNotWorking')" name="command">
              <ul>
                <li>{{ $t("api.troubleshooting.checkFormat") }}</li>
                <li>{{ $t("api.troubleshooting.checkAction") }}</li>
                <li>{{ $t("api.troubleshooting.checkModel") }}</li>
                <li>{{ $t("api.troubleshooting.checkResponse") }}</li>
              </ul>
            </el-collapse-item>
            
            <el-collapse-item :title="$t('api.troubleshooting.portInUse')" name="port">
              <p>{{ $t("api.troubleshooting.portInUseDesc") }}</p>
              <ul>
                <li>{{ $t("api.troubleshooting.changePorts") }}</li>
                <li>{{ $t("api.troubleshooting.checkOtherApps") }}</li>
              </ul>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <!-- Additional Resources -->
        <hime-title-with-divider>
          {{ $t("api.resources.title") }}
        </hime-title-with-divider>

        <el-space direction="vertical" style="width: 100%" :size="8">
          <el-button @click="openDocs" style="width: 100%">
            <el-icon><Document /></el-icon>
            {{ $t("api.resources.fullDocs") }}
          </el-button>
          
          <el-button @click="openLink('https://github.com/TSKI433/hime-display/tree/main/examples')" style="width: 100%">
            <el-icon><Folder /></el-icon>
            {{ $t("api.resources.moreExamples") }}
          </el-button>
          
          <el-button @click="openLink('https://github.com/TSKI433/hime-display/issues')" style="width: 100%">
            <el-icon><QuestionFilled /></el-icon>
            {{ $t("api.resources.reportIssue") }}
          </el-button>
        </el-space>

      </el-form>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { 
  InfoFilled, 
  WarningFilled, 
  Connection, 
  CopyDocument, 
  Document,
  Setting,
  VideoPlay,
  MagicStick,
  Monitor,
  Folder,
  QuestionFilled
} from '@element-plus/icons-vue';
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
  { 
    action: "setParameter", 
    description: t("api.endpoints.setParameter"),
    example: `{"action":"setParameter","data":{"parameterId":"ParamMouthOpenY","value":0.8}}`
  },
  { 
    action: "setParameters", 
    description: t("api.endpoints.setParameters"),
    example: `{"action":"setParameters","data":{"parameters":[{"id":"ParamMouthOpenY","value":0.8},{"id":"ParamEyeLOpen","value":1.0}]}}`
  },
  { 
    action: "setPart", 
    description: t("api.endpoints.setPart"),
    example: `{"action":"setPart","data":{"partId":"Part01ArmL","opacity":0.5}}`
  },
  { 
    action: "setParts", 
    description: t("api.endpoints.setParts"),
    example: `{"action":"setParts","data":{"parts":[{"id":"Part01ArmL","opacity":0.5},{"id":"Part01ArmR","opacity":0.5}]}}`
  },
];

const animationEndpoints = [
  { 
    action: "playMotion", 
    description: t("api.endpoints.playMotion"),
    example: `{"action":"playMotion","data":{"group":"TapBody","index":0,"priority":2}}`
  },
  { 
    action: "playRandomMotion", 
    description: t("api.endpoints.playRandomMotion"),
    example: `{"action":"playRandomMotion","data":{"group":"Idle","priority":1}}`
  },
];

const autoFeatureEndpoints = [
  { 
    action: "setAutoBreath", 
    description: t("api.endpoints.setAutoBreath"),
    example: `{"action":"setAutoBreath","data":{"enabled":true}}`
  },
  { 
    action: "setAutoEyeBlink", 
    description: t("api.endpoints.setAutoEyeBlink"),
    example: `{"action":"setAutoEyeBlink","data":{"enabled":true}}`
  },
  { 
    action: "setTrackMouse", 
    description: t("api.endpoints.setTrackMouse"),
    example: `{"action":"setTrackMouse","data":{"enabled":true}}`
  },
];

const windowEndpoints = [
  { 
    action: "showDisplay", 
    description: t("api.endpoints.showDisplay"),
    example: `{"action":"showDisplay"}`
  },
  { 
    action: "hideDisplay", 
    description: t("api.endpoints.hideDisplay"),
    example: `{"action":"hideDisplay"}`
  },
];

const quickStartExample = computed(() => {
  return `{
  "action": "setParameter",
  "data": {
    "parameterId": "ParamMouthOpenY",
    "value": 0.8
  }
}`;
});

const messageFormatExample = computed(() => {
  return `{
  "action": "string",  // Required: The command to execute
  "data": {           // Optional: Command-specific parameters
    // ... parameters vary by action
  }
}`;
});

const successResponseExample = computed(() => {
  return `{
  "status": "success",
  "message": "Command received",
  "timestamp": 1729458123456
}`;
});

const errorResponseExample = computed(() => {
  return `{
  "status": "error",
  "message": "Error description",
  "timestamp": 1729458123456
}`;
});

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

function getEndpointExample(action) {
  const allEndpoints = [
    ...modelControlEndpoints,
    ...animationEndpoints,
    ...autoFeatureEndpoints,
    ...windowEndpoints
  ];
  const endpoint = allEndpoints.find(e => e.action === action);
  return endpoint?.example || '';
}

function openDocs() {
  window.nodeAPI.openLink("https://github.com/TSKI433/hime-display/blob/main/docs/API.md");
}

function openLink(url) {
  window.nodeAPI.openLink(url);
}
</script>

<style scoped lang="scss">
// Info cards
.info-card, .guide-card, .format-card, .example-card, .troubleshooting-card, .config-card {
  margin-bottom: 16px;
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
}

.info-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;

  .info-icon {
    color: var(--el-color-primary);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .info-content {
    flex: 1;

    p {
      margin: 0 0 8px 0;
      line-height: 1.6;
    }

    ul {
      margin: 8px 0;
      padding-left: 24px;

      li {
        margin: 6px 0;
        line-height: 1.6;
      }
    }
  }
}

// Format section
.format-section {
  h4 {
    margin: 0 0 12px 0;
    color: var(--el-text-color-primary);
    font-size: 15px;
  }

  p {
    margin: 0 0 12px 0;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }
}

// Code blocks
.code-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;

  code {
    background-color: var(--el-fill-color-light);
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
}

.code-block-small {
  background-color: var(--el-fill-color-darker);
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.5;
  margin: 8px 0;
  white-space: pre;
}

.code-block {
  background-color: var(--el-fill-color-darker);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre;
}

.code-container {
  display: flex;
  flex-direction: column;
}

// Endpoint list
.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.endpoint-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);

  .endpoint-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .endpoint-name {
    font-weight: bold;
    color: var(--el-color-primary);
    font-size: 13px;
    font-family: 'Courier New', monospace;
  }

  .endpoint-example {
    margin-top: 4px;
  }
}

// Steps customization
:deep(.el-step__description) {
  padding-right: 12px;
  
  p {
    margin: 0 0 8px 0;
    line-height: 1.6;
  }

  ul {
    margin: 8px 0;
    padding-left: 20px;
    
    li {
      margin: 4px 0;
    }
  }
}

// Collapse customization
:deep(.el-collapse-item__content) {
  padding: 12px;
}

// Tabs customization
:deep(.el-tabs__content) {
  padding: 16px;
}

// Descriptions customization
:deep(.el-descriptions__label) {
  font-weight: 600;
  width: 120px;
}

// Card customization
:deep(.el-card__body) {
  padding: 16px;
}
</style>
