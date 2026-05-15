export interface Attachment {
  name: string
  size: string
  kind: string
  color: string
}

export interface Email {
  id: string
  from: string
  fromEmail: string
  subject: string
  preview: string
  body: string[]
  sig: string
  time: string
  date: 'today' | 'yesterday' | 'this week' | 'earlier'
  unread: boolean
  starred: boolean
  labels: string[]
  folder: string
  attachments: Attachment[]
  summary: string
  quickReplies: string[]
}

export interface Label {
  name: string
  color: string
}

export interface Folder {
  id: string
  name: string
  icon: string
  count: number | null
}

export type Theme = 'light' | 'dark' | 'auto'
export type View = 'inbox' | 'settings' | 'login'
export type Filter = 'all' | 'unread' | 'starred' | 'work' | 'personal' | 'reading' | 'finance' | 'travel'
