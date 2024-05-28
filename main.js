// thank you stackoverflow

var chatwindow = document.getElementById('chat')

function render_message(user, content) {

  if (user === lastName && sentMessages.has(content)) {
    return;
  }

  let spacerDiv = document.createElement('div');
  spacerDiv.classList.add('spacer');

  let messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  let nameSpan = document.createElement('span');
  nameSpan.classList.add('name');
  let contentSpan = document.createElement('span');
  contentSpan.classList.add('content');

  let name = user;
  let message = content;
  nameSpan.textContent = name + ":";
  contentSpan.textContent = message;

  messageDiv.appendChild(nameSpan);
  messageDiv.appendChild(contentSpan);

  spacerDiv.appendChild(messageDiv);

  let chatDiv = document.getElementById('chat');
  chatDiv.appendChild(spacerDiv);
  to_bottom(chatwindow)

}

function render_sent(content) {
  let spacerDiv = document.createElement('div');
  spacerDiv.classList.add('spacer');

  let messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  let nameSpan = document.createElement('span');
  nameSpan.classList.add('name_you');
  let contentSpan = document.createElement('span');
  contentSpan.classList.add('content');

  let name = "YOU";
  let message = content;
  nameSpan.textContent = name + ":";
  contentSpan.textContent = message;

  messageDiv.appendChild(nameSpan);
  messageDiv.appendChild(contentSpan);

  spacerDiv.appendChild(messageDiv);

  let chatDiv = document.getElementById('chat');
  chatDiv.appendChild(spacerDiv);
  to_bottom(chatwindow)
}

function render_system_message(content) {
  let spacerDiv = document.createElement('div');
  spacerDiv.classList.add('spacer');

  let messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  let nameSpan = document.createElement('span');
  nameSpan.classList.add('name');

  let sysSpan = document.createElement('span');
  sysSpan.classList.add('name_you');

  let contentSpan = document.createElement('span');
  contentSpan.classList.add('content');

  let message = content;
  nameSpan.textContent = "KFCR:";
  sysSpan.textContent = "SYSTEM";
  contentSpan.textContent = message;

  messageDiv.appendChild(sysSpan);
  messageDiv.appendChild(nameSpan);
  messageDiv.appendChild(contentSpan);

  spacerDiv.appendChild(messageDiv);

  let chatDiv = document.getElementById('chat');
  chatDiv.appendChild(spacerDiv);
  to_bottom(chatwindow)
}

// submit message script

function to_bottom(element) {
  element.scrollTop = element.scrollHeight;
}

// Initialize variables
var lastAddress = '';
var lastName = '';
var lastMessageID = -15; // burner value
var displayedIDs = new Set(); // Set to keep track of displayed IDs
var sentMessages = new Set(); // Set to keep track of sent messages

// Connect button event listener
document.getElementById('connect').addEventListener('click', function(event) {
  lastAddress = document.getElementById('address').value;
  lastName = document.getElementById('username').value;

  // Reset variables
  lastMessageID = -15;
  displayedIDs.clear();
  sentMessages.clear();

  // Verify server
  if (lastAddress != '') {
  fetch(`${lastAddress}/KFCR_verification`)
    .then(response => {
      if (!response.ok) {
        render_system_message(`Failed to handshake with server, received error code ${response.status}`)
        console.error("Failed to verify server");
        lastAddress = '' // to prevent server spam
      } else {
        // Fetch last 50 messages
        fetch(`${lastAddress}/messages/last/50`)
          .then(response => response.json())
          .then(data => {
            if (Array.isArray(data)) {
              lastMessageID = Math.max(...data.map(item => Number(item.id)));
              console.log(`Last ID: ${lastMessageID}`);
              // Reverse the order of the messages
              data.reverse().forEach(function(message) {
                if (!message.sys) {
                  render_message(message.user, message.content);
                } else {
                  render_system_message(message.content);
                }
              });
            }
          });
      }
    });
  } else {
    render_system_message("Nice try, silly.");
  }
});

setInterval(() => {
  if (lastAddress != "") {
    fetch(`${lastAddress}/messages/sinceid/${lastMessageID}`)
      .then(response => response.json())
      .then(data => {
        data.forEach(message => {
          if (message.id > lastMessageID && !displayedIDs.has(message.id)) {
            displayedIDs.add(message.id); // Add the ID to the set of displayed IDs
            if (!message.sys) {
              render_message(message.user, message.content);
            } else {
              render_system_message(message.content);
            }
            lastMessageID = message.id; // Update the lastMessageId to the latest message ID
          }
        });
      })
      .catch(error => {
        render_system_message(`JS error: ${error}`)
        console.log(error)
      }); // Handle any error
  }
}, 1000); // Check interval

// Send a message
document.getElementById('message_input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    var messageContent = this.value;
    this.value = ''; // Clear the input
    render_sent(messageContent); // render message

    // Check if the message has been sent before
    if (!sentMessages.has(messageContent)) {
      // Send the message
      fetch(`${lastAddress}/messages/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: lastName,
          content: messageContent
        })
      })
        .then(response => {
          if (!response.ok) {
            render_system_message(`Failed to send message, got error code ${response.status}`)
            console.error("Failed to send message");
          } else {
            sentMessages.add(messageContent); // Add the message to the set of sent messages
          }
        });
    }
  }
});