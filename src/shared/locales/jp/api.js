export default {
  // Menu
  api: "API",

  // Status
  status: "APIステータス",
  running: "APIサーバー実行中",
  stopped: "APIサーバー停止中",
  enableToStart: "設定でAPIを有効にしてサーバーを起動してください",

  // Configuration
  configuration: "設定",
  enableApi: "APIサーバーを有効にする",
  enableApiDesc: "WebSocketとHTTPを介してLive2Dモデルを外部制御できます",
  wsPort: "WebSocketポート",
  wsPortDesc: "WebSocket接続用ポート（リアルタイム双方向通信）",
  httpPort: "HTTPポート",
  httpPortDesc: "HTTP REST APIポート（シンプルな一方向リクエスト）",
  restartRequired: "ポート変更を適用するにはアプリケーションを再起動してください",

  // Quick Actions
  quickActions: "クイックアクション",
  testConnection: "接続をテスト",
  copyWebSocketUrl: "WebSocket URLをコピー",
  copyHttpUrl: "HTTP URLをコピー",
  openDocumentation: "ドキュメントを開く",
  connectionSuccess: "API接続成功！",
  connectionFailed: "APIに接続できませんでした。有効化されて実行中か確認してください。",
  copiedToClipboard: "クリップボードにコピーしました",

  // Endpoints
  availableEndpoints: "利用可能なエンドポイント",
  modelControl: "モデル制御",
  animations: "アニメーション",
  autoFeatures: "自動機能",
  windowControl: "ウィンドウ制御",

  endpoints: {
    setParameter: "単一のLive2Dパラメータ値を設定",
    setParameters: "複数のLive2Dパラメータを一度に設定",
    setPart: "モデルパーツの不透明度を設定",
    setParts: "複数のモデルパーツを一度に設定",
    playMotion: "特定のモーションアニメーションを再生",
    playRandomMotion: "グループからランダムにモーションを再生",
    setAutoBreath: "自動呼吸を有効/無効にする",
    setAutoEyeBlink: "自動まばたきを有効/無効にする",
    setTrackMouse: "マウストラッキングを有効/無効にする",
    showDisplay: "ディスプレイウィンドウを表示",
    hideDisplay: "ディスプレイウィンドウを非表示",
  },

  // Example Code
  exampleCode: "サンプルコード",
  copyCode: "コードをコピー",
};
