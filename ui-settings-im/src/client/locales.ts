/** zh copy for the IM channels settings section. */
export const zh = {
  nav: 'IM 通道',
  intro: '管理飞书、微信、QQ、钉钉通道实例。每个实例独立连接一个机器人；同一平台可建多个实例。',
  empty: '还没有通道实例。点击下方添加。',
  add: '添加通道',
  addTitle: '添加 IM 通道',
  name: '实例名（小写字母、数字、连字符）',
  nameInvalid: '实例名只能包含小写字母、数字、连字符，且以字母开头。',
  nameTaken: '该实例名已被占用。',
  kind: '平台',
  cancel: '取消',
  create: '创建',
  enable: '启用',
  disable: '停用',
  remove: '删除',
  removeTitle: '删除通道',
  removeConfirm: '确定删除实例 {name} 吗？已绑定该实例的用户不受影响，但新消息将无人应答。',
} as const

/** en copy for the IM channels settings section. */
export const en = {
  nav: 'IM Channels',
  intro: 'Manage Feishu, WeChat, QQ, and DingTalk channel instances. Each instance connects one bot; a platform may have several.',
  empty: 'No channel instances yet. Add one below.',
  add: 'Add channel',
  addTitle: 'Add IM channel',
  name: 'Instance name (lowercase letters, digits, hyphens)',
  nameInvalid: 'Instance names may only contain lowercase letters, digits, and hyphens, starting with a letter.',
  nameTaken: 'That instance name is already taken.',
  kind: 'Platform',
  cancel: 'Cancel',
  create: 'Create',
  enable: 'Enable',
  disable: 'Disable',
  remove: 'Remove',
  removeTitle: 'Remove channel',
  removeConfirm: 'Remove instance {name}? Bound users keep their sessions, but new messages go unanswered.',
} as const

export type ImKey = keyof typeof zh
