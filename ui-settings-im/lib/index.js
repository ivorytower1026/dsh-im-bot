//#region src/client/locales.ts
/** zh copy for the Bot Channel tab. */
const zh = {
	nav: "手机连接",
	intro: "选择一个平台，手机扫码即可创建/绑定机器人并接入 harness。",
	cards: "平台",
	"card.wechat": "微信",
	"card.feishu": "飞书",
	"qr.waiting": "正在获取二维码…",
	"qr.alt": "登录二维码",
	"qr.refresh": "刷新二维码",
	"qr.refreshHint": "点击二维码可刷新",
	"qr.confirmed": "登录成功，机器人已接入。",
	"bindings.title": "已绑定的机器人",
	"bindings.empty": "还没有绑定。手机扫码登录后在 IM 上发送 /bind 完成绑定。",
	"bindings.kind": "平台",
	"bindings.session": "会话",
	"bindings.boundAt": "绑定时间",
	"bindings.remove": "解绑",
	"bind.commandTitle": "完成绑定",
	"bind.commandHint": "在 IM 上发送以下命令完成绑定：",
	"steps.title.wechat": "微信接入步骤",
	"step.wechat.1": "用手机微信「扫一扫」扫描左侧二维码。",
	"step.wechat.2": "在手机上确认授权，完成机器人绑定。",
	"step.wechat.3": "页面提示「登录成功」后，即可在微信里与机器人对话。",
	"step.wechat.4": "发送 /bind 绑定你的会话。",
	"note.wechat.verifycode": "如微信要求输入验证码，请在启动 harness 的终端中改用终端登录流程。",
	"steps.title.feishu": "飞书接入步骤",
	"step.feishu.1": "用手机飞书「扫一扫」扫描左侧二维码。",
	"step.feishu.2": "在飞书授权页选择「创建新应用」或绑定已有应用。",
	"step.feishu.3": "确认授权——应用会自动配好机器人能力与事件订阅。",
	"step.feishu.4": "页面提示「登录成功」后，即可在飞书里与机器人对话。"
};
/** en copy for the Bot Channel tab. */
const en = {
	nav: "Mobile Connect",
	intro: "Pick a platform and scan the QR code from your phone to create/bind your bot.",
	cards: "Platform",
	"card.wechat": "WeChat",
	"card.feishu": "Feishu",
	"qr.waiting": "Fetching QR code…",
	"qr.alt": "Login QR code",
	"qr.refresh": "Refresh QR code",
	"qr.refreshHint": "Click the QR code to refresh",
	"qr.confirmed": "Logged in — your bot is connected.",
	"bindings.title": "Bound bots",
	"bindings.empty": "No bindings yet. Scan to log in, then send /bind from your IM.",
	"bindings.kind": "Platform",
	"bindings.session": "Session",
	"bindings.boundAt": "Bound at",
	"bindings.remove": "Unbind",
	"bind.commandTitle": "Finish binding",
	"bind.commandHint": "Send this command in your IM to bind:",
	"steps.title.wechat": "WeChat setup",
	"step.wechat.1": "Scan the QR code with WeChat on your phone.",
	"step.wechat.2": "Confirm the authorization to bind your bot.",
	"step.wechat.3": "Once the page says connected, chat with your bot in WeChat.",
	"step.wechat.4": "Send /bind to bind your session.",
	"note.wechat.verifycode": "If WeChat asks for a verification code, use the terminal login flow in the terminal running the harness.",
	"steps.title.feishu": "Feishu setup",
	"step.feishu.1": "Scan the QR code with Feishu on your phone.",
	"step.feishu.2": "Choose \"create a new app\" or bind an existing one.",
	"step.feishu.3": "Confirm — bot capability and event subscriptions are configured automatically.",
	"step.feishu.4": "Once the page says connected, chat with your bot in Feishu."
};
//#endregion
//#region src/index.ts
/**
* Mobile Connect settings plugin. Node half: empty apply — this package
* exists for its `dsh.client` browser bundle (the Plugins-section "手机连接"
* tab); the loader row exists only so the client-modules scanner sees it.
*/
const name = "ui-settings-im";
function apply() {}
//#endregion
export { apply, en, name, zh };
