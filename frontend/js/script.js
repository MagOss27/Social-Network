//login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

//cores para o nome do usuário
const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    const time = document.createElement("span");

    div.classList.add("message--self");
    div.innerHTML = content

    time.classList.add("message--time");
    time.textContent = getCurrentTime();

    div.appendChild(time);

    return div;
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")
    const time = document.createElement("span");

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor

    time.classList.add("message--time");
    time.textContent = getCurrentTime();

    span.innerHTML = sender
    div.appendChild(span)

    div.innerHTML += content
    div.appendChild(time);

    return div
}

const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    const message = userId == user.id
        ? createMessageSelfElement(content)
        : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message);

    scrollScreen()
}

const createSystemMessageElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--system");
    div.innerHTML = content;
    return div;
};

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    // Exibe mensagem de entrada do usuário na rede social
    const systemMessage = createSystemMessageElement(`${user.name} entrou na Rede Social`);
    chatMessages.appendChild(systemMessage);

    websocket = new WebSocket("wss://social-network-backend-hzi8.onrender.com");
    websocket.onmessage = processMessage

    // websocket.onopen = () => websocket.send(`Usuário: ${user.name} entrou no chat!`);
    // console.log(user);
}

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }

    websocket.send(JSON.stringify(message));

    chatInput.value = ""
}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);