/** The supported bot platform kinds. */
export const KINDS = ['feishu', 'wechat'] as const
export type Kind = typeof KINDS[number]
