export default {
  // Menu
  api: "API",

  // Status
  status: "API 状态",
  running: "API 服务器运行中",
  stopped: "API 服务器已停止",
  enableToStart: "在配置中启用 API 以启动服务器",

  // Configuration
  configuration: "配置",
  enableApi: "启用 API 服务器",
  enableApiDesc: "允许通过 WebSocket 和 HTTP 外部控制 Live2D 模型",
  wsPort: "WebSocket 端口",
  wsPortDesc: "WebSocket 连接端口（实时双向通信）",
  httpPort: "HTTP 端口",
  httpPortDesc: "HTTP REST API 端口（简单单向请求）",
  restartRequired: "重启应用程序以应用端口更改",

  // Quick Actions
  quickActions: "快速操作",
  testConnection: "测试连接",
  copyWebSocketUrl: "复制 WebSocket URL",
  copyHttpUrl: "复制 HTTP URL",
  openDocumentation: "打开文档",
  connectionSuccess: "API 连接成功！",
  connectionFailed: "无法连接到 API。请确保已启用并正在运行。",
  copiedToClipboard: "已复制到剪贴板",

  // Endpoints
  availableEndpoints: "可用端点",
  modelControl: "模型控制",
  animations: "动画",
  autoFeatures: "自动功能",
  windowControl: "窗口控制",

  endpoints: {
    setParameter: "设置单个 Live2D 参数值",
    setParameters: "一次设置多个 Live2D 参数",
    setPart: "设置模型部件透明度",
    setParts: "一次设置多个模型部件",
    playMotion: "播放特定动作动画",
    playRandomMotion: "播放组中的随机动作",
    setAutoBreath: "启用/禁用自动呼吸",
    setAutoEyeBlink: "启用/禁用自动眨眼",
    setTrackMouse: "启用/禁用鼠标跟踪",
    showDisplay: "显示展示窗口",
    hideDisplay: "隐藏展示窗口",
  },

  // Example Code
  exampleCode: "示例代码",
  copyCode: "复制代码",
};
