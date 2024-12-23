const chatBody = document.querySelector('.chat-body');
const messageInput = document.querySelector('.message-input');
const sendMessageButton = document.querySelector('#send-message');
const fileInput = document.querySelector('#file-input');
const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
const fileCancelButton = document.querySelector('#file-cancel');



const API_KEY = "AIzaSyCMeuwMB4kbpIBr0pZg5tp7nnSaFLaIsVk";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const userData = {
    message: null,
    file:{
        data:null,
        mime_type: null
    }
}



const createMessageElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add('message', ...classes);
    div.innerHTML = content;
    return div;


}
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector('.message-text')
    const requestOptions = {
        method: 'POST',
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts:  [{  text: userData.message  }, ...(userData.file.data ? [{inline_data:userData.file }]: [])]
        
    }]
})
}
try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if(!response.ok) throw new Error(data.error.message);
    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,'$1').trim();
    messageElement.innerText = apiResponseText

} catch (error) {
    console.log(error);
    messageElement.innerText = error.message;
    messageElement.style.color = '#ff0000'

}finally{
    userData.file = {};
    incomingMessageDiv.classList.remove('thinking'); 
    chatBody.scrollTo({top:chatBody.scrollHeight,behavior:'smooth'});
}

}

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove('file-upload');


    const MessageContent = `<div class="message-text"></div> ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class='attachment' />`:''}`

   const outgoingMessageDiv = createMessageElement(MessageContent, 'user-message');
    outgoingMessageDiv.querySelector('.message-text').textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({top:chatBody.scrollHeight,behavior:'smooth'});


    setTimeout(() => {
        const MessageContent = `<i class="fa-solid fa-robot bot-avatar" height="50" width="50" viewBox="0 0 1024 1024"></i>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`

        const incomingMessageDiv = createMessageElement(MessageContent, 'bot-message', 'thinking');
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({top:chatBody.scrollHeight,behavior:'smooth'});
        generateBotResponse(incomingMessageDiv);



    }, 600);
}

messageInput.addEventListener('keydown', (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === 'Enter' && userMessage) {
        handleOutgoingMessage(e);
    }

});
fileInput.addEventListener('change',() =>{
    const file = fileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) =>{
        fileUploadWrapper.querySelector('img').src = e.target.result;
        fileUploadWrapper.classList.add('file-upload');
        const base64String = e.target.result.split(',')[1];
        userData.file = {
            data:base64String,
            mime_type: file.type
        }
        fileInput.value ='';
    }
    reader.readAsDataURL(file);
});
fileCancelButton.addEventListener('click',() =>{
    userData.file ={};
        fileUploadWrapper.classList.remove('file-upload');

    
});
const picker = new EmojiMart.Picker({
    theme:'light',
    skinTonePosition:'none',
    previewPosition:'none',
    onClickOutside:(e) =>{
        if(e.target.id === 'emoji-picker'){

            document.body.classList.toggle('show-emoji-picker');
            
        }else {
            document.body.classList.remove('show-emoji-picker');

        }
    }
});
document.querySelector('.chat-form').appendChild(picker)

sendMessageButton.addEventListener('click', () => handleOutgoingMessage(e));
document.querySelector('#file-upload').addEventListener('click',() =>fileInput.click());