# im-channel 设计方案

国内 IM 前端通道：飞书、微信、QQ、钉钉。用户在手机上与自己的 DeepSeek Harness agent 对话。

## 总体架构

```
im-channel 插件（外部包，经 dsh plugin --profile <p> add 安装）
├── core/            平台无关
│   ├── channel.ts   ImChannel 接口：connect / onMessage / send / stop
│   ├── bind-store   口令绑定存储（~/.dsh/im-channel/bindings.json）
│   └── router.ts    消息路由：命令 → 绑定检查 → driver.prompt → 回复
├── plugin/
│   ├── driver.ts    AgentDriver 实现：ctx.agents.create + followup + whenIdle
│   └── index.ts     Cordis 插件入口（inject agents）
└── channels/        各平台适配器（逐个实现）
    feishu / wechat / qq / dingtalk
```

## 数据流

```
手机 IM → 平台长连接(WS/长轮询) → channel 解析为 InboundMessage
  → router：/bind 等命令? → BindStore
            绑定消息      → HarnessDriver.prompt(sessionId, text)
                          → agent.followup() → whenIdle() → assistant/message 拼接
          ← channel.send(target, { text, markdown })
```

## 两条绑定线（互相独立）

1. **机器人凭证（扫码）**——终端渲染二维码，手机扫码，凭证存 `~/.dsh/im-channel/credentials/<kind>.json`（0600）。每平台 SDK 原生支持。
2. **用户绑定（口令）**——harness 启动时终端显示 `BIND-XXXXXX`（10 分钟一次性）；用户在 IM 里发 `/bind BIND-XXXXXX`，通过后该 IM 用户绑定到一个新建 session。

## 四平台

| 平台 | 传输 | 登录 | SDK |
|---|---|---|---|
| feishu | WSClient 长连接 | 自建应用 appId/secret（可 OAuth 扫码） | @larksuiteoapi/node-sdk |
| wechat | iLink 长轮询 getupdates | 终端二维码（移植 openclaw-weixin，MIT） | 自实现 api/ 模块 |
| qq | 官方 bot WebSocket | qqbot-connector qrConnect() 扫码回凭证 | @tencent-connect/qqbot-connector |
| dingtalk | dingtalk-stream WS | 群内自定义机器人（勾 Stream 模式）→ clientId/secret | dingtalk-stream |

实施顺序：wechat → qq → feishu → dingtalk（用户价值 × 实现难度权衡）。

## Harness 集成（机制已验证）

- 插件声明 `export const inject = ['agents']`；`ctx.agents.create({sessionId, meta:{cwd}, agentOptions})` → `AgentHandle`
- 发消息：`createUserMessage({content:[{type:'text',text}],source:{kind:'user'}})` + `agent.followup(msg)`
- 收回复：`ctx.on('session/event')` 收 `assistant/message` text 块拼接；`agent/inbox/claimed` 关联 turn；`whenIdle()` 落定
- Bundle 声明：package.json `"dsh": { "bundle": { "patch": "cordis.patch.yml" } }`，patch 为 id 定向 YAML 行（replace config / insert 行 / `!!js` 表达式）
- 配置：`ctx.settings` 命名空间（settings.yaml `im-channel:` 节）；凭证走 `ctx.credentials.resolve(ref)`

## 安全

- 绑定口令一次性 + 10 分钟 TTL + 常数时间比较
- 凭证文件 0600，目录 ~/.dsh/im-channel/
- 默认仅已绑定用户可对话；未绑定收到提示文本
- 工具审批首版策略：允许白名单工具，拒绝其余（后续可接飞书/钉钉卡片按钮）

## 配置（cordis.yml 示例）

```yaml
- id: im-channel
  name: '@dsh-extra/im-channel'
  inject: [agents]
  config:
    channels:
      feishu: { enabled: true, appIdEnv: FEISHU_APP_ID, appSecretEnv: FEISHU_APP_SECRET }
      wechat: { enabled: true }
      qq: { enabled: true }
      dingtalk: { enabled: false, clientIdEnv: DINGTALK_CLIENT_ID, clientSecretEnv: DINGTALK_CLIENT_SECRET }
    commandPrefix: "/"
```
