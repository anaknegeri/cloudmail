// API response types (mirrors mail-vue types and actual worker API)

export interface ApiEmail {
  emailId: number
  sendEmail: string
  sendName: string       // sender name
  name: string
  accountId: number
  userId: number
  subject: string
  code: string
  text: string
  content: string       // HTML content
  html: string | null   // HTML content (alternative field)
  messageType: number   // 0=text, 1=html
  cc: string            // JSON array string
  bcc: string           // JSON array string
  recipient: string      // JSON array: [{address, name}]
  toEmail: string
  toName: string
  inReplyTo: string
  relation: string
  messageId: string
  type: number           // 0=receive, 1=send, 3=draft (draft is local only)
  status: number         // 0=received, 1=sent, 2=delivered, 3=bounced, 4=complained, 5=delayed, 7=noRecipient
  resendEmailId: string
  message: string | null
  unread: number         // 0=read, 1=unread
  createTime: string
  isDel: number          // 0=normal, 1=deleted
  starId: number | null
  isStar: number         // 0=no, 1=starred
  attachment: string | null  // JSON array string
  attList: ApiAttachment[]
  // Computed fields (added by Vue)
  checked?: boolean
  formatText?: string
  formatCreateTime?: string
}

export interface ApiAttachment {
  name: string
  key: string
  size: number
  type: string
}

export interface ApiEmailListResponse {
  list: ApiEmail[]
  total: number
  latestEmail: ApiEmail | null
}

export interface UserAccount {
  accountId: number
  email: string
  name: string
  status: number
  latestEmailTime: string | null
  createTime: string
  userId: number
  allReceive: number
  sort: number
  isDel: number
}

export interface UserInfo {
  userId?: number
  email?: string
  name?: string
  role?: string
  permKeys?: string[]
  account?: {
    accountId: number
    email?: string
    name?: string
    allReceive?: number
  }
  [key: string]: unknown
}

export interface SiteSettings {
  title?: string
  r2Domain?: string
  loginOpacity?: number
  loginDarkenFactor?: number
  background?: string
  linuxdoSwitch?: boolean
  register?: number
  loginDomain?: number
  regKey?: number
  siteKey?: string
  autoRefresh?: number
  [key: string]: unknown
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
