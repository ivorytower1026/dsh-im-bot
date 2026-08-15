/** zh copy for the Bot Channel tab. */
export const zh = {
  nav: 'Bot Channel',
  intro: '选择一个平台，手机扫码即可创建/绑定机器人并接入 harness。',
  cards: '平台',
  'card.wechat': '微信',
  'card.qq': 'QQ',
  'card.feishu': '飞书',
  'card.dingtalk': '钉钉',
  'qr.waiting': '正在获取二维码…',
  'qr.alt': '登录二维码',
  'qr.confirmed': '登录成功，机器人已接入。',
} as const

/** en copy for the Bot Channel tab. */
export const en = {
  nav: 'Bot Channel',
  intro: 'Pick a platform and scan the QR code from your phone to create/bind your bot.',
  cards: 'Platform',
  'card.wechat': 'WeChat',
  'card.qq': 'QQ',
  'card.feishu': 'Feishu',
  'card.dingtalk': 'DingTalk',
  'qr.waiting': 'Fetching QR code…',
  'qr.alt': 'Login QR code',
  'qr.confirmed': 'Logged in — your bot is connected.',
} as const

export type ImKey = keyof typeof zh
