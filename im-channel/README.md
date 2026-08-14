# im-channel

国内 IM 前端通道插件：飞书、微信、QQ、钉钉。手机上与你的 DeepSeek Harness agent 对话。

设计文档见 [DESIGN.md](./DESIGN.md)。

## 安装

```sh
# 在 deepseek-harness 仓库内构建后，把本插件装入 profile：
dsh plugin --profile web add D:/project/fork_project/deepseek-harness-plugins/im-channel
dsh --profile web   # 启动；终端显示绑定口令
```

## 各平台登录/配置

| 平台 | 一次性准备 | 凭证文件 |
|---|---|---|
| 微信 | 终端二维码扫码（iLink 协议） | `~/.dsh/im-channel/credentials/wechat.json` |
| QQ | 终端二维码扫码（qqbot-connector） | `~/.dsh/im-channel/credentials/qq.json` |
| 飞书 | 开放平台建自建应用（机器人能力 + 长连接），保存 appId/appSecret | `~/.dsh/im-channel/credentials/feishu.json` |
| 钉钉 | 群内建自定义机器人（勾选 Stream 模式），保存 clientId/clientSecret | `~/.dsh/im-channel/credentials/dingtalk.json` |

## 使用

1. 启动 harness，终端出现 `手机绑定口令：BIND-XXXXXX`
2. 手机 IM 里给机器人发 `/bind BIND-XXXXXX`
3. 直接对话

命令：`/bind <口令>`、`/unbind`、`/status`

## 许可

MIT。微信通道的 iLink 协议实现移植自 [Tencent/openclaw-weixin](https://github.com/Tencent/openclaw-weixin)（MIT，Copyright (C) 2026 Tencent）。
