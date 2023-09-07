/*
 * Jet client-server communications:
 */
import { Fetcher, Peer } from '../../../src'
import './base.css'

const peer = new Peer({ url: 'ws://localhost:8081/' })

const renderMessages = (messages: { value: string[] }) => {
  const messageContainer = document.getElementById('messages')!
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild)
  }
  messages.value.forEach((message: string) => {
    const entry = document.createElement('li')
    entry.innerText = message
    messageContainer.appendChild(entry)
  })
}

const messageFetcher = new Fetcher()
  .path('equals', 'chat/messages')
  .on('data', renderMessages)

document
  .getElementById('message-form')!
  .addEventListener('submit', function (event) {
    event.preventDefault()
    const messageInput = document.getElementById('message')! as HTMLInputElement
    const sendButton = document.getElementById('send')! as HTMLButtonElement
    const message = messageInput.value
    messageInput.disabled = true
    sendButton.disabled = true
    peer
      .call('chat/append', {
        message: message
      })
      .then(function () {
        messageInput.disabled = false
        sendButton.disabled = false
        messageInput.value = ''
        messageInput.focus()
      })
  })

document.getElementById('clear')!.addEventListener('click', () => {
  peer.call('chat/clear', [])
})

peer.connect().then(() => peer.fetch(messageFetcher))
