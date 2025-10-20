import { Application } from "@display/Application";
window.app = new Application();
const ipcAPI = window.nodeAPI.ipc;
window.onerror = function (message) {
  //   console.log(message, source, lineno, colno, error);
  ipcAPI.throwError(message);
};
// 上方法的操作无法捕获异步函数里面的错误
window.addEventListener("unhandledrejection", function (event) {
  ipcAPI.throwError(event.reason.message);
});

// Setup console forwarding to control panel
let consoleForwardingEnabled = false;

const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};

const setupConsoleForwarding = () => {
  console.log = (...args) => {
    originalConsole.log(...args);
    if (consoleForwardingEnabled) {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      ipcAPI.sendConsoleLog('log', message, new Date().toLocaleTimeString());
    }
  };

  console.info = (...args) => {
    originalConsole.info(...args);
    if (consoleForwardingEnabled) {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      ipcAPI.sendConsoleLog('info', message, new Date().toLocaleTimeString());
    }
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    if (consoleForwardingEnabled) {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      ipcAPI.sendConsoleLog('warn', message, new Date().toLocaleTimeString());
    }
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    if (consoleForwardingEnabled) {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      ipcAPI.sendConsoleLog('error', message, new Date().toLocaleTimeString());
    }
  };
};

setupConsoleForwarding();

ipcAPI.handleEnableConsoleForwarding(() => {
  consoleForwardingEnabled = true;
  console.info('[Display] Console forwarding enabled');
});
