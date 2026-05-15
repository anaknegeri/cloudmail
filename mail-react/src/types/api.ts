// API response types (mirrors mail-vue types)

export interface ApiEmail {
  emailId: number
  subject: string
  message: string        // JSON: { message: string }
  messageType: number    // 0=text, 1=html
  html: string | null
  sendEmail: string
  sendName: string
  recipient: string      // JSON: [{address, name}]
  createTime: string
  unread: number         // 0=read, 1=unread
  isStar: number         // 0=no, 1=starred
  attachment: string | null  // JSON array of attachment objects
  accountId: number
  type: number           // 1=receive, 2=send, 3=draft
}

export interface ApiAttachment {
  name: string
  key: string
  size: number
  type: string
}

export interface UserAccount {
  accountId: number
  email: string
  name: string
  allReceive: number  // 0 or 1
}

export interface UserInfo {
  userId: number
  name: string
  email: string
  role: string
  perms: string[]
}

export interface SiteSettings {
  title: string
  description: string
  logo: string
  r2Domain: string
  registerEnable: number
  inviteEnable: number
  linuxDoEnable: number
  domainList: string[]
}

// EmailType enum
export const EmailType = {
  RECEIVE: 1,
  SEND: 2,
  DRAFT: 3,
} as const

// Unread enum
export const EmailUnread = {
  UNREAD: 1,
  READ: 0,
} as const
