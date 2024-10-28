// Инициализация Firebase
const firebaseConfig = {
      apiKey: "AIzaSyAhJwmFlIgXt0z6gcoErRTXQo3kkjDqOuo",
  authDomain: "lastp-44a37.firebaseapp.com",
  databaseURL: "https://lastp-44a37-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lastp-44a37",
  storageBucket: "lastp-44a37.appspot.com",
  messagingSenderId: "972643290372",
  appId: "1:972643290372:web:c42fdc293cf8cac0609451",
  measurementId: "G-C7R84JG5XZ"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

// Функция регистрации
function registerUser(email, password, name) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userEmail = email.replace(".", ",").replace("@", "_");
            
            // Сохранение дополнительной информации о пользователе
            return database.ref('addresses/' + userEmail).set({
                name: name,
                email: email,
                is: "user"
            });
        })
        .catch((error) => {
            console.error("Registration error:", error);
            alert(error.message);
        });
}

// Функция входа
function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Logged in successfully:", user.email);
            window.location.href = 'main.html'; // Перенаправление после входа
        })
        .catch((error) => {
            console.error("Login error:", error);
            alert(error.message);
        });
}

// Функционал чатов
function startChat(currentUserName, chatUserName) {
    const chatReferenceAtoB = database.ref(`chats/${currentUserName}_${chatUserName}`);
    const chatReferenceBtoA = database.ref(`chats/${chatUserName}_${currentUserName}`);

    return { chatReferenceAtoB, chatReferenceBtoA };
}

function sendMessage(chatRef, message, currentUserName) {
    const messageId = chatRef.push().key;
    const messageData = {
        text: message,
        sender: currentUserName,
        timestamp: Date.now()
    };
    
    return chatRef.child(messageId).set(messageData);
}

// Функционал постов
function createPost(title, content, imageUrl) {
    const user = auth.currentUser;
    if (!user) return Promise.reject('User not authenticated');

    const postsRef = database.ref('posts');
    return postsRef.push({
        title: title,
        content: content,
        imageUrl: imageUrl,
        userId: user.uid,
        timestamp: Date.now()
    });
}

// Функционал мероприятий (Rulse)
function createEvent(theme, description, date, metka, imageUrl) {
    const user = auth.currentUser;
    if (!user) return Promise.reject('User not authenticated');

    const bannersRef = database.ref('banners');
    return bannersRef.push({
        theme: theme,
        description: description,
        date: date,
        metka: metka,
        imageUrl: imageUrl,
        userId: user.uid,
        participantsCount: 0,
        participants: []
    });
}

// Обработчики событий DOM
document.addEventListener('DOMContentLoaded', function() {
    // Регистрация
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            const name = document.getElementById('nameInput').value;
            registerUser(email, password, name);
        });
    }

    // Вход
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            loginUser(email, password);
        });
    }

    // Создание поста
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('titleInput').value;
            const content = document.getElementById('contentInput').value;
            const imageUrl = document.getElementById('imageInput').value;
            createPost(title, content, imageUrl);
        });
    }

    // Создание мероприятия
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const theme = document.getElementById('themeInput').value;
            const description = document.getElementById('descriptionInput').value;
            const date = document.getElementById('dateInput').value;
            const metka = document.getElementById('metkaInput').value;
            const imageUrl = document.getElementById('imageInput').value;
            createEvent(theme, description, date, metka, imageUrl);
        });
    }
});

// Проверка состояния аутентификации
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        // Дополнительная логика при входе пользователя
    } else {
        console.log('No user is signed in');
        // Перенаправление на страницу входа, если пользователь не авторизован
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Вспомогательные функции
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function getCurrentUserEmail() {
    const user = auth.currentUser;
    return user ? user.email.replace(".", ",").replace("@", "_") : null;
}

// Экспорт функций
export {
    registerUser,
    loginUser,
    startChat,
    sendMessage,
    createPost,
    createEvent,
    getCurrentUserEmail
};
