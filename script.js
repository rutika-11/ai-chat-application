const API_KEY = 'ENTER_YOUR_APIKEY';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const searchToggle = document.getElementById('search-grounding');

// Configure Markdown options
marked.setOptions({
    highlight: function(code, lang) {
        return hljs.highlightAuto(code).value;
    },
    breaks: true
});

function appendMessage(content, sender) {
    const div = document.createElement('div');
    div.classList.add(sender === 'user' ? 'user-bubble' : 'ai-bubble');
    
    if (sender === 'ai') {
        div.innerHTML = marked.parse(content); // Render Markdown
        div.querySelectorAll('pre code').forEach((block) => hljs.highlightBlock(block));
    } else {
        div.textContent = content;
    }
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

async function getAIResponse(prompt) {
    const typingDiv = appendMessage("Thinking...", "ai");
    
    // Check if Search Grounding is enabled
    const tools = searchToggle.checked ? [{ "google_search_retrieval": {} }] : [];

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                tools: tools // This enables Google Search!
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        typingDiv.innerHTML = marked.parse(aiText);
        typingDiv.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));

    } catch (error) {
        typingDiv.innerText = "Error: Connection failed.";
        console.error(error);
    }
}

sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) {
        appendMessage(text, "user");
        userInput.value = '';
        getAIResponse(text);
    }
});

// Auto-expand textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});
