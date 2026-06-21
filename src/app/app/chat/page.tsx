import { Suspense } from 'react'
import { ChatClient } from '@/components/app/chat-client'

export default function ChatPage() {
  return (
    <Suspense>
      <ChatClient />
    </Suspense>
  )
}
