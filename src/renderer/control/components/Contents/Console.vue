<template>
  <div class="console-container">
    <div class="console-header">
      <el-button-group>
        <el-button size="small" @click="clearLogs">Clear</el-button>
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
    <div class="console-content" ref="consoleContent">
      <div
        v-for="(log, index) in filteredLogs"
        :key="index"
        :class="['log-entry', `log-${log.type}`]"
      >
        <span class="log-time">{{ log.time }}</span>
        <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';

const logs = ref([]);
const logLevels = ref(['log', 'info', 'warn', 'error']);
const autoscroll = ref(true);
const consoleContent = ref(null);

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};

const addLog = (type, args) => {
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
  
  logs.value.push({
    type,
    message,
    time,
    timestamp: Date.now()
  });

  // Limit logs to 1000 entries
  if (logs.value.length > 1000) {
    logs.value.shift();
  }

  if (autoscroll.value) {
    nextTick(() => {
      if (consoleContent.value) {
        consoleContent.value.scrollTop = consoleContent.value.scrollHeight;
      }
    });
  }
};

const filteredLogs = computed(() => {
  return logs.value.filter(log => logLevels.value.includes(log.type));
});

const clearLogs = () => {
  logs.value = [];
};

const toggleAutoscroll = () => {
  autoscroll.value = !autoscroll.value;
};

// Override console methods
onMounted(() => {
  console.log = (...args) => {
    originalConsole.log(...args);
    addLog('log', args);
  };

  console.info = (...args) => {
    originalConsole.info(...args);
    addLog('info', args);
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    addLog('warn', args);
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    addLog('error', args);
  };

  // Add initial message
  console.info('Console logging started');
});

// Restore original console methods
onBeforeUnmount(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});
</script>

<style lang="scss" scoped>
.console-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
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
