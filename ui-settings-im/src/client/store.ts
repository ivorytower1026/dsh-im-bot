/** The four supported bot platform kinds. */
export const KINDS = ['feishu', 'wechat', 'qq'] as const
export type Kind = typeof KINDS[number]
