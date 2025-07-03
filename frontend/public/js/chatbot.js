const openChatbotBtn = document.getElementById('open-chatbot');
const chatbotWidget = document.getElementById('chatbot-widget');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');

openChatbotBtn.onclick = function() {
  chatbotWidget.style.display = chatbotWidget.style.display === 'none' ? 'block' : 'none';
  if (chatbotWidget.style.display === 'block') chatbotInput.focus();
};

chatbotForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const userMsg = chatbotInput.value.trim();
  if (!userMsg) return;
  appendMessage('You', userMsg);
  chatbotInput.value = '';
  chatbotInput.disabled = true;

  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });
    const data = await res.json();
    appendMessage('AI', data.reply || 'Sorry, I could not answer that.');
  } catch (err) {
    appendMessage('AI', 'Error connecting to chatbot.');
  }
  chatbotInput.disabled = false;
  chatbotInput.focus();
});

function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatbotMessages.appendChild(msgDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}