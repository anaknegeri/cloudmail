import { useMailStore } from '../store/mail'
import InboxList from '../screens/InboxList'
import Reader from '../screens/Reader'
import { useParams } from 'react-router-dom'

interface MailPageProps {
  emailType: number  // 0=inbox, 1=sent, 3=draft
  pageTitle?: string
}

export default function MailPage({ emailType, pageTitle }: MailPageProps) {
  const { emailId } = useParams<{ emailId: string }>()
  const { selectedEmail, setSelectedEmail, setReplyEmail, setComposeOpen } = useMailStore()

  // Sync selected email from URL param when emailId changes
  // (The actual email object lookup happens in InboxList via the selectedId prop)
  void emailId
  void pageTitle

  return (
    <div
      className="grid gap-3 min-w-0 overflow-hidden"
      style={{ gridTemplateColumns: selectedEmail ? '400px 1fr' : '1fr' }}
    >
      <InboxList
        selectedId={selectedEmail?.emailId ?? null}
        emailType={emailType}
        onSelect={email => setSelectedEmail(email)}
      />

      {selectedEmail && (
        <Reader
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onDeleted={() => setSelectedEmail(null)}
          onReply={(email) => { setReplyEmail(email); setComposeOpen(true) }}
        />
      )}
    </div>
  )
}
