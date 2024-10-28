// Инициализация Firebase
const db = firebase.database();
const chatsRef = db.ref('chats');

// Функция инициализации чата
function initChat() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('Пользователь не авторизован');
        return;
    }

    // Получение элементов интерфейса
    const messagesContainer = document.getElementById('messagesLayout');
    const messageInput = document.getElementById('messageEditText');
    const sendButton = document.getElementById('sendButton');
    const sendImageButton = document.getElementById('sendImageButton');
    const sendVideoButton = document.getElementById('sendVideoButton');
    const scrollView = document.getElementById('scrollView');

    // Получение параметров чата из URL или других источников
    const chatUserName = getChatUserName(); // Имя собеседника
    const currentUserName = currentUser.displayName || currentUser.email;
    const chatId = generateChatId(currentUserName, chatUserName);

    // Слушатель сообщений
    listenToMessages(chatId, messagesContainer, scrollView);

    // Обработчик отправки текстовых сообщений
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                sendMessage(chatId, message, 'text', currentUserName);
                messageInput.value = '';
            }
        });
    }

    // Обработчик отправки изображений
    if (sendImageButton) {
        sendImageButton.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    uploadAndSendImage(chatId, file, currentUserName);
                }
            };
            input.click();
        });
    }

    // Обработчик отправки видео
    if (sendVideoButton) {
        sendVideoButton.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    uploadAndSendVideo(chatId, file, currentUserName);
                }
            };
            input.click();
        });
    }
}

// Функция прослушивания сообщений
function listenToMessages(chatId, container, scrollView) {
    chatsRef.child(chatId).on('value', (snapshot) => {
        container.innerHTML = '';
        
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            const messageElement = createMessageElement(message);
            container.appendChild(messageElement);
        });

        // Прокрутка к последнему сообщению
        if (scrollView) {
            scrollView.scrollTop = scrollView.scrollHeight;
        }
    });
}

// Функция создания элемента сообщения
function createMessageElement(message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${
        message.sender === getCurrentUser().displayName ? 'sent' : 'received'
    }`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    // Обработка разных типов сообщений
    switch (message.type) {
        case 'text':
            messageContent.textContent = message.text;
            break;
        case 'image':
            const img = document.createElement('img');
            img.src = message.url;
            img.className = 'message-image';
            img.onclick = () => showFullScreenImage(message.url);
            messageContent.appendChild(img);
            break;
        case 'video':
            const video = document.createElement('video');
            video.src = message.url;
            video.className = 'message-video';
            video.controls = true;
            messageContent.appendChild(video);
            break;
    }

    messageContainer.appendChild(messageContent);

    // Добавление времени отправки
    const timeStamp = document.createElement('span');
    timeStamp.className = 'message-timestamp';
    timeStamp.textContent = formatMessageTime(message.timestamp);
    messageContainer.appendChild(timeStamp);

    // Добавление контекстного меню
    messageContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showMessageContextMenu(message, messageContainer);
    });

    return messageContainer;
}

// Функция отправки сообщения
async function sendMessage(chatId, content, type, sender) {
    try {
        const messageData = {
            text: content,
            type: type,
            sender: sender,
            timestamp: Date.now()
        };

        await chatsRef.child(chatId).push(messageData);
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        alert('Ошибка при отправке сообщения');
    }
}

// Функция загрузки и отправки изображения
async function uploadAndSendImage(chatId, file, sender) {
    try {
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(`chat_images/${Date.now()}_${file.name}`);
        
        // Показать индикатор загрузки
        showLoadingIndicator();

        await imageRef.put(file);
        const imageUrl = await imageRef.getDownloadURL();

        const messageData = {
            type: 'image',
            url: imageUrl,
            sender: sender,
            timestamp: Date.now()
        };

        await chatsRef.child(chatId).push(messageData);
        hideLoadingIndicator();
    } catch (error) {
        console.error('Ошибка при отправке изображения:', error);
        alert('Ошибка при отправке изображения');
        hideLoadingIndicator();
    }
}

// Функция загрузки и отправки видео
async function uploadAndSendVideo(chatId, file, sender) {
    try {
        const storageRef = firebase.storage().ref();
        const videoRef = storageRef.child(`chat_videos/${Date.now()}_${file.name}`);
        
        // Показать индикатор загрузки
        showLoadingIndicator();

        await videoRef.put(file);
        const videoUrl = await videoRef.getDownloadURL();

        const messageData = {
            type: 'video',
            url: videoUrl,
            sender: sender,
            timestamp: Date.now()
        };

        await chatsRef.child(chatId).push(messageData);
        hideLoadingIndicator();
    } catch (error) {
        console.error('Ошибка при отправке видео:', error);
        alert('Ошибка при отправке видео');
        hideLoadingIndicator();
    }
}

// Вспомогательные функции
function generateChatId(user1, user2) {
    return [user1, user2].sort().join('_');
}

function formatMessageTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
}

function showLoadingIndicator() {
    // Реализация показа индикатора загрузки
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.body.appendChild(loader);
}

function hideLoadingIndicator() {
    // Реализация скрытия индикатора загрузки
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

function showFullScreenImage(url) {
    // Реализация показа изображения в полноэкранном режиме
    const fullScreenImage = document.createElement('img');
    fullScreenImage.src = url;
    fullScreenImage.className = 'full-screen-image';
    document.body.appendChild(fullScreenImage);
}

function showMessageContextMenu(message, messageContainer) {
    // Реализация контекстного меню для сообщения
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Копировать';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(message.text);
        contextMenu.remove();
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.onclick = async () => {
        try {
            await chatsRef.child(message.chatId).child(message.id).remove();
            contextMenu.remove();
        } catch (error) {
            console.error('Ошибка при удалении сообщения:', error);
            alert('Ошибка при удалении сообщения');
        }
    };

    contextMenu.appendChild(copyButton);
    contextMenu.appendChild(deleteButton);

    messageContainer.appendChild(contextMenu);
}

function getCurrentUser() {
    return firebase.auth().currentUser;
}

function getChatUserName() {
    // Реализация получения имени собеседника из URL или других источников
    // ...
}
