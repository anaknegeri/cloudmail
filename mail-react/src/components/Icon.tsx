interface IconProps {
  name: string
  size?: number
  stroke?: number
  className?: string
}

export default function Icon({ name, size = 18, stroke = 1.6, className }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }

  switch (name) {
    case 'inbox':
      return <svg {...props}><path d="M3 13l3-8h12l3 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/><path d="M3 13h5l1 2h6l1-2h5"/></svg>
    case 'star':
      return <svg {...props}><path d="M12 3l2.6 5.6 6 .6-4.5 4.2 1.3 6L12 16.6 6.6 19.4l1.3-6L3.4 9.2l6-.6L12 3z"/></svg>
    case 'star-fill':
      return <svg {...props} fill="currentColor"><path d="M12 3l2.6 5.6 6 .6-4.5 4.2 1.3 6L12 16.6 6.6 19.4l1.3-6L3.4 9.2l6-.6L12 3z"/></svg>
    case 'moon':
      return <svg {...props}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
    case 'send':
      return <svg {...props}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
    case 'file-text':
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
    case 'edit':
      return <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
    case 'archive':
      return <svg {...props}><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
    case 'shield':
      return <svg {...props}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/></svg>
    case 'trash':
      return <svg {...props}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    case 'settings':
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
    case 'tag':
      return <svg {...props}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.4"/></svg>
    case 'users':
      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'reply':
      return <svg {...props}><path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
    case 'reply-all':
      return <svg {...props}><path d="M7 17l-5-5 5-5"/><path d="M12 17l-5-5 5-5"/><path d="M22 18v-2a4 4 0 0 0-4-4h-7"/></svg>
    case 'forward':
      return <svg {...props}><path d="M15 17l5-5-5-5"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg>
    case 'more':
      return <svg {...props}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>
    case 'close':
      return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'minimize':
      return <svg {...props}><path d="M5 12h14"/></svg>
    case 'expand':
      return <svg {...props}><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
    case 'paperclip':
      return <svg {...props}><path d="M21.4 11.05l-9 9a5.5 5.5 0 0 1-7.78-7.78l9-9a3.7 3.7 0 0 1 5.2 5.2L10 17.1a1.8 1.8 0 0 1-2.6-2.6L15.2 6.7"/></svg>
    case 'image':
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    case 'smile':
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
    case 'sparkle':
      return <svg {...props}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 14l.7 2L22 17l-2.3 1L19 20l-.7-2L16 17l2.3-1z"/></svg>
    case 'check':
      return <svg {...props}><path d="M20 6L9 17l-5-5"/></svg>
    case 'arrow-right':
      return <svg {...props}><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
    case 'plus':
      return <svg {...props}><path d="M12 5v14"/><path d="M5 12h14"/></svg>
    case 'mail':
      return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
    case 'bell':
      return <svg {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
    case 'globe':
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/></svg>
    case 'lock':
      return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
    case 'key':
      return <svg {...props}><path d="M21 2l-2 2m-7.6 3.6A4 4 0 1 0 3 11a4 4 0 0 0 8.4-3.4L21 2z"/><path d="M15 11l-3 3"/></svg>
    case 'bar-chart-2':
      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    case 'sun':
      return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
    case 'palette':
      return <svg {...props}><path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.5 1.5-1.3s-.5-1.3-.5-2c0-.8.7-1.4 1.5-1.4H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/></svg>
    case 'kbd':
      return <svg {...props}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>
    case 'chevron-right':
      return <svg {...props}><path d="M9 18l6-6-6-6"/></svg>
    case 'corner-up-left':
      return <svg {...props}><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
    case 'calendar':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'paint':
      return <svg {...props}><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M10 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1l-1 4h-4l-1-4h-3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>
    default:
      return null
  }
}
