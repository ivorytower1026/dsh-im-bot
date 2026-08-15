/** Inline platform brand marks (simplified single-path forms). */

interface MarkProps {
  size?: number
}

export function WechatMark({ size = 26 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#07C160" d="M9.3 4C5.3 4 2 6.8 2 10.2c0 1.9 1 3.5 2.7 4.6l-.7 2.1 2.4-1.2c.6.2 1.3.3 2 .4-.2-.5-.3-1.1-.3-1.6 0-3.2 3.1-5.7 6.8-5.7h.4C14.7 6 12.2 4 9.3 4zM7.1 8.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm4.5 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
      <path fill="#07C160" d="M22 14.4c0-2.8-2.8-5.1-6.1-5.1s-6.1 2.3-6.1 5.1 2.8 5.1 6.1 5.1c.6 0 1.2-.1 1.8-.3l2.1 1-.6-1.8c1.7-.9 2.8-2.4 2.8-4.1zm-8.1-.8c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8zm4 0c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8z" />
    </svg>
  )
}

export function QqMark({ size = 26 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#12B7F5" d="M12 2C8.1 2 5 5.1 5 9c0 1.6-.3 3-.9 4.4-.4 1-1.4 2.1-1 2.9.3.7 1.3.5 1.9.9.3.2.2.7.5 1 .4.4 1.2.3 1.4.8.2.6-.5 1.4-.1 1.9.4.5 1.4.1 2.1.2.8.1 1.4.9 2.1.9s1.3-.8 2.1-.9c.7-.1 1.7.3 2.1-.2.4-.5-.3-1.3-.1-1.9.2-.5 1-.4 1.4-.8.3-.3.2-.8.5-1 .6-.4 1.6-.2 1.9-.9.4-.8-.6-1.9-1-2.9-.6-1.4-.9-2.8-.9-4.4 0-3.9-3.1-7-7-7z" />
      <circle cx="9.2" cy="9" r="1.2" fill="#fff" />
      <circle cx="14.8" cy="9" r="1.2" fill="#fff" />
    </svg>
  )
}

export function FeishuMark({ size = 26 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#3370FF" d="M3.5 4.2 15.8 2c.6-.1 1.1.3 1.2.9l.9 6.5-10.4 1.9c-.5.1-.9-.2-1-.7L3.5 4.2z" />
      <path fill="#3370FF" d="m7.4 12.4 10.9-2 1.2 8.9c.1.6-.3 1.1-.9 1.2L6.2 22.6c-.6.1-1.1-.3-1.2-.9l-.6-4.2 3-5.1z" />
      <path fill="#00D6B9" d="m4.4 17.5.6-12c0-.6.5-1 1-.9l12.3 1.8-13.9 11.1z" />
    </svg>
  )
}

export function DingtalkMark({ size = 26 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#0089FF" d="M21 8.8c0-.1 0-.1 0 0-1.2-1.2-3.1-2-5.3-2.1l.3-1.4h3.7c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7H6.6c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h4.2c1.3.1 2 1.3 1.7 2.6l-.2 1.1C8.3 9.4 5.4 11.3 5.4 13.9c0 2.6 2.4 4.2 6.3 4.1 4.4-.1 7.1-2.3 7.5-5.6.2-1.4-.2-2.7-1.1-3.6.9-.1 2-.3 2.9 0zM12 16.1c-2.6.1-4.1-.8-4.1-2.2 0-1.5 1.9-2.8 4.7-3l-.6 5.2z" />
    </svg>
  )
}
