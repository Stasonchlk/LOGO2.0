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

// Получение ссылок на элементы UI
document.addEventListener('DOMContentLoaded', function() {
    // Кнопки навигации
    const eventsButton = document.getElementById('eventsButton');
    const postsButton = document.getElementById('postsButton');
    const profileButton = document.getElementById('profileButton');
    const messagesButton = document.getElementById('messagesButton');
    
    // Обработчики событий для кнопок
    if(eventsButton) {
        eventsButton.addEventListener('click', () => {
            window.location.href = 'activity_create_rulse.xml';
        });
    }

    if(postsButton) {
        postsButton.addEventListener('click', () => {
            window.location.href = 'activity_create_post.xml';
        });
    }

    if(profileButton) {
        profileButton.addEventListener('click', () => {
            window.location.href = 'activity_profile.xml';
        });
    }

    if(messagesButton) {
        messagesButton.addEventListener('click', () => {
            window.location.href = 'activity_chats.xml';
        });
    }
    
    // Проверка аутентификации
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Пользователь авторизован
            console.log('User is signed in');
            // Можно добавить дополнительную логику
        } else {
            // Пользователь не авторизован
            console.log('No user is signed in');
            window.location.href = 'activity_code_input.xml';
        }
    });
});

// Функции для работы с Firebase
function createPost(title, content, imageUrl) {
    const db = firebase.database();
    const user = firebase.auth().currentUser;
    
    return db.ref('posts').push({
        title: title,
        content: content,
        imageUrl: imageUrl,
        userId: user.uid,
        timestamp: Date.now()
    });
}

function createEvent(title, description, date, location) {
    const db = firebase.database();
    const user = firebase.auth().currentUser;
    
    return db.ref('events').push({
        title: title,
        description: description,
        date: date,
        location: location,
        userId: user.uid,
        timestamp: Date.now()
    });
}

// Обработка сообщений
function sendMessage(recipientId, message) {
    const db = firebase.database();
    const user = firebase.auth().currentUser;
    
    return db.ref('messages').push({
        senderId: user.uid,
        recipientId: recipientId,
        message: message,
        timestamp: Date.now()
    });
}

// Функции для работы с профилем
function updateProfile(displayName, photoURL) {
    const user = firebase.auth().currentUser;
    
    return user.updateProfile({
        displayName: displayName,
        photoURL: photoURL
    });
}

// Обработка ошибок
function handleError(error) {
    console.error('Error:', error);
    // Можно добавить отображение ошибки пользователю
    alert('Произошла ошибка: ' + error.message);
}

// Утилиты
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function validateInput(input) {
    return input && input.trim().length > 0;
}

// Экспорт функций если используются модули
export {
    createPost,
    createEvent,
    sendMessage,
    updateProfile,
    handleError,
    formatDate,
    validateInput
};
