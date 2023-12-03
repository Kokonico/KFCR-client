
// thank you stackoverflow


function render_message(user, content) {
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

// verification script
function verify(url) {
  fetch(url + '/KFCR_verification')
    .then(response => {
      if (!response.ok) {
        return false
      } else {
        return true
      }
    })
}

// send attempt

function send(msg_content, user, url) {
  fetch(url + '/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "user": user,
      "content": msg_content
    })
  })
    .then(response => {
      if (!response.ok) {
        render_system_message("failed to post message.")
      }
    })
};

function clear_field(text) {
  text.value = ""
};


// message submitted

let message = document.getElementById('message_input');

let form = document.getElementById('controlbar');

let textFields = document.querySelectorAll('.config');

let chatwindow = document.getElementById('chat');

let load_history = document.getElementById('connect');

message.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    render_sent(message.value);
    send(message.value, document.getElementById('username').value, document.getElementById('address').value);
    clear_field(message);
  }
})

load_history.addEventListener('click', function(event) {
  console.log(event)
  fetch(document.getElementById('address').value + '/messages')
    .then(response => {
      if (!response.ok) {
        render_system_message("failed to load history.")
      }
      return response.json()
    })
    .then(data => {
      data.forEach(function(message_store) {
        if (message_store.sys == false) {
          render_message(message_store.user, message_store.content)
        } else {
          render_system_message(message_store.content)
        }
      })
    })
})

// receiver

var previousContent = {
  "user": "",
  "content": ""
}

setInterval(() => {
  fetch(document.getElementById('address').value + '/messages/latest', {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (JSON.stringify(data) !== JSON.stringify(previousContent) && data.user !== document.getElementById('username').value) {
        render_message(data.user, data.content);
        previousContent = data;
      }
    })
    .catch(error => void (0)); // it's probably fine
}, 1000);  // check interval