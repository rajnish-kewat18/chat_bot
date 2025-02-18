let prompt = document.querySelector("#prompt")
let voiceButton = document.querySelector("#voice")
let initialText = document.querySelector("#initialText")

let chatContainer = document.querySelector(".chat-container")


const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCokzlR7nGP99C2uPiJaDhzfQcdExwxdJo"

let user = {
    data: null,
    allMessages: []
}




async function generateResponse(aiChatBox) {


    let text = aiChatBox.querySelector(".ai-chat-area")

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [{ "text": user.data }

                    ]
                }]

        })


    }

    try {
        let response = await fetch(Api_Url, RequestOption)
        let data = await response.json()
        let apiResponse = data.candidates[0].content.parts[0].text.replace().trim()
        let cleanedResponse = cleanResponse(apiResponse);
        text.innerHTML = cleanedResponse;

        user.allMessages.push({ type: 'ai', text: cleanedResponse });
        let tmpDiv = document.createElement("div");
        tmpDiv.style.display = "inline-block";
        tmpDiv.style.visibility = "hidden";
        tmpDiv.style.whiteSpace = "pre-wrap";
        tmpDiv.innerText = apiResponse;
        document.body.appendChild(tmpDiv);
        let contentWidth = Math.min(tmpDiv.scrollWidth, chatContainer.offsetWidth - 20);
        aiChatBox.style.width = `${contentWidth}px`;
        text.style.width = `${contentWidth}px`;

        document.body.removeChild(tmpDiv);


    }



    catch (error) {
        console.log(error);
    }

    finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

    }

}
function createChatBox(html, classes) {
    let div = document.createElement("div")
    div.innerHTML = html
    div.classList.add(classes)
    return div
}


function handlechatResponse(message) {
    if (message.trim() !== "") {
        user.data = message;

        user.allMessages.push({ type: 'user', text: user.data });
        let html = `<div class="user-chat-area">
                        ${user.data}
                    </div>`


        prompt.value = ""
        let userChatBox = createChatBox(html, "user-chat-box")
        chatContainer.appendChild(userChatBox)

        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

        setTimeout(() => {

            let html = `<div class="ai-chat-area">                      
            </div>`
            let aiChatBox = createChatBox(html, "ai-chat-box")
            chatContainer.appendChild(aiChatBox)
            generateResponse(aiChatBox)

        }, 50)
    }
}



prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value)

    }
})


prompt.addEventListener("focus", () => { prompt.value = ''; });



voiceButton.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;


    prompt.placeholder = "Listening...";

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        console.error('Additional information:', event.message);
        prompt.placeholder = "Message...";
        if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
            alert('Microphone access issue. Please check your microphone and permissions.');

        }

    };

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript
        prompt.value = speechResult;
        prompt.placeholder = "Message...";
        handlechatResponse(speechResult);

    };
    recognition.onspeechend = () => {
        recognition.stop();
        handlechatResponse(prompt.value)
        prompt.placeholder = "Message...";
    };

    recognition.start();

});


function hideInitialText() {
    initialText.style.display = "none";
}

prompt.addEventListener("click", hideInitialText);



prompt.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        hideInitialText();
    }
});


chatContainer.addEventListener("scroll", function () {
    if (chatContainer.scrollTop === 0) {
        displayPreviousMessages();
    }
});


function displayPreviousMessages() {
    function displayPreviousMessages() {
        user.allMessages.forEach(message => {
            let html = `<div class="${message.type === 'user' ? 'user-chat-area' : 'ai-chat-area'}">${message.text}</div>`;
            let chatBox = createChatBox(html, `${message.type}-chat-box`);
            chatContainer.appendChild(chatBox);
        });
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    }

}
function scrollToStart() {
    chatContainer.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function cleanResponse(response) {
    return response.replace(/\*/g, '').trim();
}
