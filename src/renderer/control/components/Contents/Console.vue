<template>
  <div class="console-container">
    <el-tabs v-model="activeTab" type="card" class="console-tabs">
      <el-tab-pane label="Control Panel" name="control">
        <div class="console-header">
          <el-button-group>
            <el-button size="small" @click="clearLogs('control')">Clear</el-button>
            <el-button size="small" @click="toggleAutoscroll">
              Auto-scroll: {{ autoscroll ? 'ON' : 'OFF' }}
            </el-button>
          </el-button-group>
          <el-checkbox-group v-model="logLevels" size="small">
            <el-checkbox-button label="log">Log</el-checkbox-button>
            <el-checkbox-button label="info">Info</el-checkbox-button>
            <el-checkbox-button label="warn">Warn</el-checkbox-button>
            <el-checkbox-button label="error">Error</el-checkbox-button>
          </el-checkbox-group>
        </div>
        <div class="console-content" ref="controlConsoleContent">
          <div
            v-for="(log, index) in filteredControlLogs"
            :key="index"
            :class="['log-entry', `log-${log.type}`]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="Display Window" name="display">
        <div class="console-header">
          <el-button-group>
            <el-button size="small" @click="clearLogs('display')">Clear</el-button>
            <el-button size="small" @click="toggleAutoscroll">
              Auto-scroll: {{ autoscroll ? 'ON' : 'OFF' }}
            </el-button>
          </el-button-group>
          <el-checkbox-group v-model="logLevels" size="small">
            <el-checkbox-button label="log">Log</el-checkbox-button>
            <el-checkbox-button label="info">Info</el-checkbox-button>
            <el-checkbox-button label="warn">Warn</el-checkbox-button>
            <el-checkbox-button label="error">Error</el-checkbox-button>
          </el-checkbox-group>
        </div>
        <div class="console-content" ref="displayConsoleContent">
          <div
            v-for="(log, index) in filteredDisplayLogs"
            :key="index"
            :class="['log-entry', `log-${log.type}`]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useAppStore } from '@control/store/app';

const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;

// Separate global stores for control and display logs
if (!window.__controlConsoleLogs) {
  window.__controlConsoleLogs = [];
}

if (!window.__displayConsoleLogs) {
  window.__displayConsoleLogs = [];
}

if (!window.__consoleOriginal) {
  window.__consoleOriginal = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  // Override console methods globally (only once) - these are for Control Panel
  const addToGlobalLogs = (type, args) => {
    const message = args
      .map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    const time = new Date().toLocaleTimeString();
    
    window.__controlConsoleLogs.push({
      type,
      message,
      time,
      timestamp: Date.now()
    });

    // Limit logs to 1000 entries
    if (window.__controlConsoleLogs.length > 1000) {
      window.__controlConsoleLogs.shift();
    }
  };

  console.log = (...args) => {
    window.__consoleOriginal.log(...args);
    addToGlobalLogs('log', args);
  };

  console.info = (...args) => {
    window.__consoleOriginal.info(...args);
    addToGlobalLogs('info', args);
  };

  console.warn = (...args) => {
    window.__consoleOriginal.warn(...args);
    addToGlobalLogs('warn', args);
  };

  console.error = (...args) => {
    window.__consoleOriginal.error(...args);
    addToGlobalLogs('error', args);
  };
}

const activeTab = ref('control');
const controlLogs = ref([]);
const displayLogs = ref([]);
const logLevels = ref(['log', 'info', 'warn', 'error']);
const autoscroll = ref(true);
const controlConsoleContent = ref(null);
const displayConsoleContent = ref(null);
let updateInterval = null;

const filteredControlLogs = computed(() => {
  return controlLogs.value.filter(log => logLevels.value.includes(log.type));
});

const filteredDisplayLogs = computed(() => {
  return displayLogs.value.filter(log => logLevels.value.includes(log.type));
});

// Sync the reactive arrays with the global arrays
const syncLogs = () => {
  // Only update if lengths differ to avoid unnecessary reactivity
  if (controlLogs.value.length !== window.__controlConsoleLogs.length) {
    controlLogs.value = [...window.__controlConsoleLogs];
  }
  if (displayLogs.value.length !== window.__displayConsoleLogs.length) {
    displayLogs.value = [...window.__displayConsoleLogs];
  }
};

const clearLogs = (which) => {
  if (which === 'control') {
    window.__controlConsoleLogs.length = 0;
    controlLogs.value = [];
  } else if (which === 'display') {
    window.__displayConsoleLogs.length = 0;
    displayLogs.value = [];
  }
};

const toggleAutoscroll = () => {
  autoscroll.value = !autoscroll.value;
};

const scrollToBottom = () => {
  if (autoscroll.value) {
    nextTick(() => {
      if (activeTab.value === 'control' && controlConsoleContent.value) {
        controlConsoleContent.value.scrollTop = controlConsoleContent.value.scrollHeight;
      } else if (activeTab.value === 'display' && displayConsoleContent.value) {
        displayConsoleContent.value.scrollTop = displayConsoleContent.value.scrollHeight;
      }
    });
  }
};

// Watch for new logs and auto-scroll
watch(() => controlLogs.value.length, scrollToBottom);
watch(() => displayLogs.value.length, scrollToBottom);
watch(activeTab, scrollToBottom);

// Listen for display window console messages
onMounted(() => {
  // Poll the global arrays for changes every 100ms
  updateInterval = setInterval(syncLogs, 100);
  // Listen for console messages from display window
  ipcAPI.handleDisplayConsoleLog((event, { type, message, time }) => {
    window.__displayConsoleLogs.push({
      type,
      message,
      time,
      timestamp: Date.now()
    });

    // Limit logs to 1000 entries
    if (window.__displayConsoleLogs.length > 1000) {
      window.__displayConsoleLogs.shift();
    }
  });

  // Request display window to start sending console messages
  // Do this after setting up the listener
  if (appStore.displayWindowId !== -1) {
    ipcAPI.enableDisplayConsoleForwarding();
  }

  // Test logs
  console.log('Console component mounted - this is a test log');
  console.info('This is an info message');
  console.warn('This is a warning message');
  console.error('This is an error message');

  scrollToBottom();
});

onBeforeUnmount(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style lang="scss" scoped>
.console-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

.console-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }
  
  :deep(.el-tab-pane) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.console-content {
  flex: 1;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 8px;
}

.log-entry {
  padding: 4px 0;
  white-space: pre-wrap;
  word-break: break-word;
  border-bottom: 1px solid var(--el-border-color-lighter);
  
  &:last-child {
    border-bottom: none;
  }
}

.log-time {
  color: var(--el-text-color-secondary);
  margin-right: 8px;
}

.log-type {
  font-weight: bold;
  margin-right: 8px;
}

.log-message {
  color: var(--el-text-color-primary);
}

.log-log {
  .log-type {
    color: var(--el-color-info);
  }
}

.log-info {
  .log-type {
    color: var(--el-color-primary);
  }
}

.log-warn {
  .log-type {
    color: var(--el-color-warning);
  }
  background-color: rgba(var(--el-color-warning-rgb), 0.1);
}

.log-error {
  .log-type {
    color: var(--el-color-error);
  }
  background-color: rgba(var(--el-color-error-rgb), 0.1);
}
</style>
