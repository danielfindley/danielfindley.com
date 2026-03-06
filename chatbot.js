// Update this URL after deploying the worker
const WORKER_URL = "https://danielfindley-chatbot.danielfindley.workers.dev";

const chatHTML = `
<button class="chat-toggle" aria-label="Open chat">
  <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
</button>
<div class="chat-window">
  <div class="chat-header">
    <span class="dot"></span>
    <span>Ask about Daniel</span>
  </div>
  <div class="chat-messages">
    <div class="chat-msg bot">Hey! Ask me anything about Daniel — his work, skills, projects, or background.</div>
  </div>
  <div class="chat-input-area">
    <input type="text" placeholder="Type a message..." aria-label="Chat message">
    <button aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
  </div>
</div>`;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.innerHTML = chatHTML;
  document.body.appendChild(container);

  const toggle = container.querySelector(".chat-toggle");
  const window_ = container.querySelector(".chat-window");
  const input = container.querySelector(".chat-input-area input");
  const sendBtn = container.querySelector(".chat-input-area button");
  const messages = container.querySelector(".chat-messages");

  let history = [];

  toggle.addEventListener("click", () => {
    window_.classList.toggle("open");
    if (window_.classList.contains("open")) input.focus();
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    appendMsg(text, "user");
    history.push({ role: "user", content: text });
    input.value = "";
    sendBtn.disabled = true;

    // Show typing indicator
    const typing = appendMsg("Thinking...", "bot typing");

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      typing.remove();

      const reply = data.reply || "Sorry, something went wrong.";
      appendMsg(reply, "bot");
      history.push({ role: "assistant", content: reply });
    } catch {
      typing.remove();
      appendMsg("Couldn't reach the chatbot. Try again later.", "bot");
    }

    sendBtn.disabled = false;
    input.focus();
  }

  function appendMsg(text, classes) {
    const div = document.createElement("div");
    div.className = "chat-msg " + classes;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });
});
