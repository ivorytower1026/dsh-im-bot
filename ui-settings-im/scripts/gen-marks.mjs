// One-off generator: converts the reference logos in logs/ into the data-URI
// platform-marks.tsx. Run with: node scripts/gen-marks.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const b64 = name => readFileSync(`D:/temp-${name}-b64.txt`, 'utf8')

const content = `/** Platform brand marks — QQ/Feishu/DingTalk are bitmaps converted from the user-provided official logo files; WeChat is an inline SVG. */

interface MarkProps {
  size?: number
}

function MarkImg({ src, size = 26 }: MarkProps & { src: string }) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ objectFit: 'contain' }}
    />
  )
}

const QQ_PNG = 'data:image/png;base64,${b64('qq')}'
const FEISHU_PNG = 'data:image/png;base64,${b64('feishu')}'
const DINGTALK_PNG = 'data:image/png;base64,${b64('dingtalk')}'

export function WechatMark({ size = 26 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#07C160" d="M9.3 4C5.3 4 2 6.8 2 10.2c0 1.9 1 3.5 2.7 4.6l-.7 2.1 2.4-1.2c.6.2 1.3.3 2 .4-.2-.5-.3-1.1-.3-1.6 0-3.2 3.1-5.7 6.8-5.7h.4C14.7 6 12.2 4 9.3 4zM7.1 8.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm4.5 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
      <path fill="#07C160" d="M22 14.4c0-2.8-2.8-5.1-6.1-5.1s-6.1 2.3-6.1 5.1 2.8 5.1 6.1 5.1c.6 0 1.2-.1 1.8-.3l2.1 1-.6-1.8c1.7-.9 2.8-2.4 2.8-4.1zm-8.1-.8c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8zm4 0c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8z" />
    </svg>
  )
}

export function QqMark(props: MarkProps) {
  return <MarkImg {...props} src={QQ_PNG} />
}

export function FeishuMark(props: MarkProps) {
  return <MarkImg {...props} src={FEISHU_PNG} />
}

export function DingtalkMark(props: MarkProps) {
  return <MarkImg {...props} src={DINGTALK_PNG} />
}
`

writeFileSync(new URL('../src/client/platform-marks.tsx', import.meta.url), content)
console.log('written', content.length, 'chars')
