import { useState } from 'react'
import InboxList from './InboxList'
import Reader from './Reader'
import type { ApiEmail } from '../types/api'
import { useMailStore } from '../store/mail'

export default function Sent() {
  const [selectedEmail, setSelectedEmail] = useState<ApiEmail | null>(null)
  const setComposeOpen = useMailStore(s => s.setComposeOpen)
  const setReplyEmail = useMailStore(s => s.setReplyEmail)

  return (
    <div className="grid gap-3 min-w-0 overflow-hidden" style={{ gridTemplateColumns: selectedEmail ? '400px 1fr' : '1fr' }}>
      <InboxList
        selectedId={selectedEmail?.emailId ?? null}
        onSelect={email => setSelectedEmail(email)}
        emailType={1}
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
