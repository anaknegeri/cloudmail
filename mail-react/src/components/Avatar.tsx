import { colorForName, initials } from '../data'

interface AvatarProps {
  name: string
  size?: number
  radius?: number
  className?: string
}

export default function Avatar({ name, size = 36, radius = 12, className = '' }: AvatarProps) {
  const [c1, c2] = colorForName(name || '?')
  const init = initials(name || '?')

  return (
    <div
      className={`grid place-items-center font-semibold text-white flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        fontSize: Math.round(size * 0.36),
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}
    >
      {init}
    </div>
  )
}
