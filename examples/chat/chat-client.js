/*
 * Jet client-server communications:
 */

var jet = require('node-jet')

var peer = new jet.Peer({ port: 11123 })

var renderMessages = function (messages) {
  var messageContainer = document.getElementById('messages')
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild)
  }
  messages.value.forEach(function (message) {
    var entry = document.createElement('li')
    entry.innerText = message
    messageContainer.appendChild(entry)
  })
}

var messageFetcher = new jet.Fetcher()
  .path('equals', 'chat/messages')
  .on('data', renderMessages)

document
  .getElementById('message-form')
  .addEventListener('submit', function (event) {
    event.preventDefault()
    var messageInput = document.getElementById('message')
    var sendButton = document.getElementById('send')
    var message = messageInput.value
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

document.getElementById('clear').addEventListener('click', function (event) {
  peer.call('chat/clear')
})

peer.connect().then(() => peer.fetch(messageFetcher))
