// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

// cores para o nome do usuário
const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }

let websocket;

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    const time = document.createElement("span");

    div.classList.add("message--self");
    div.innerHTML = content;

    time.classList.add("message--time");
    time.textContent = getCurrentTime();

    div.appendChild(time);

    return div;
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const time = document.createElement("span");

    div.classList.add("message--other");

    span.classList.add("message--sender");
    span.style.color = senderColor;

    time.classList.add("message--time");
    time.textContent = getCurrentTime();

    span.innerHTML = sender;
    div.appendChild(span);

    div.innerHTML += content;
    div.appendChild(time);

    return div;
}

const createSystemMessageElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--system");
    div.textContent = content;
    return div;
};

const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: "smooth"
    });
};

const processMessage = ({ data }) => {
    const { type, userId, userName, userColor, content } = JSON.parse(data);

    let message;

    if (type === "system") {
        // Mensagem do sistema
        message = createSystemMessageElement(content);
    } else if (type === "image") {
        // Mensagem de imagem
        message = createImageMessageElement(content, userName, userColor);
    } else {
        // Mensagem de texto
        message = userId === user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor);
    }

    chatMessages.appendChild(message);
    scrollScreen();
};

// Função para criar uma mensagem de imagem
const createImageMessageElement = (imageSrc, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const time = document.createElement("span");

    div.classList.add("message--other");

    span.classList.add("message--sender");
    span.style.color = senderColor;

    time.classList.add("message--time");
    time.textContent = getCurrentTime();

    span.innerHTML = sender;
    div.appendChild(span);

    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Imagem enviada";
    img.classList.add("message--image");

    div.appendChild(img);
    div.appendChild(time);

    return div;
};

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://social-network-backend-hzi8.onrender.com");

    websocket.onopen = () => {
        // Envia uma mensagem de sistema informando que o usuário entrou
        const joinMessage = {
            type: "system",
            content: `${user.name} entrou na Rede Social`
        };
        websocket.send(JSON.stringify(joinMessage));
    };

    websocket.onmessage = processMessage;
};

const sendMessage = (event) => {
    event.preventDefault();

    const messageContent = chatInput.value;
    const imageFile = chatForm.querySelector(".chat__file").files[0];

    let message = {};

    if (imageFile) {
        // Se for uma imagem, converte para base64
        const reader = new FileReader();
        reader.onloadend = () => {
            message = {
                type: "image",
                userId: user.id,
                userName: user.name,
                userColor: user.color,
                content: reader.result // O conteúdo será a imagem em base64
            };
            websocket.send(JSON.stringify(message));
        };
        reader.readAsDataURL(imageFile); // Lê a imagem como base64
    } else if (messageContent.trim() !== "") {
        // Caso contrário, envia apenas a mensagem de texto
        message = {
            type: "chat",
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: messageContent
        };
        websocket.send(JSON.stringify(message));
    }

    chatInput.value = "";
    chatForm.querySelector(".chat__file").value = ""; // Limpa o campo de arquivo
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
