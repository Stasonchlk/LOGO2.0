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

// DOM элементы
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const eventsContainer = document.getElementById('eventsContainer');
const postsContainer = document.getElementById('postsContainer');

// Модальное окно
loginBtn.onclick = () => loginModal.style.display = "block";
closeBtn.onclick = () => loginModal.style.display = "none";
window.onclick = (e) => {
    if (e.target == loginModal) {
        loginModal.style.display = "none";
    }
}

// Обработка входа
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            loginModal.style.display = "none";
            alert('Успешный вход!');
        })
        .catch((error) => {
            alert('Ошибка: ' + error.message);
        });
});

// Загрузка мероприятий
function loadEvents() {
    const bannersRef = database.ref('banners');
    bannersRef.on('value', (snapshot) => {
        eventsContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const event = childSnapshot.val();
            const eventElement = createEventElement(event);
            eventsContainer.appendChild(eventElement);
        });
    });
}

// Создание элемента мероприятия
function createEventElement(event) {
    const div = document.createElement('div');
    div.className = 'event-card';
    div.innerHTML = `
        <h3>${event.theme}</h3>
        <p>${event.description}</p>
        <p>Дата: ${event.date}</p>
        <p>Место: ${event.metka}</p>
        ${event.imageUrl ? `<img src="${event.imageUrl}" alt="Event image">` : ''}
        <p>Участники: ${event.participantsCount}/${event.participants}</p>
    `;
    return div;
}

// Загрузка постов
function loadPosts() {
    const postsRef = database.ref('posts');
    postsRef.on('value', (snapshot) => {
        postsContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    });
}

// Создание элемента поста
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : ''}
    `;
    return div;
}

// Навигация между разделами
document.getElementById('eventsButton').addEventListener('click', () => {
    eventsContainer.style.display = 'block';
    postsContainer.style.display = 'none';
});

document.getElementById('postsButton').addEventListener('click', () => {
    eventsContainer.style.display = 'none';
    postsContainer.style.display = 'block';
});

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    loadPosts();
});

// Отслеживание состояния авторизации
auth.onAuthStateChanged((user) => {
    if (user) {
        loginBtn.textContent = 'Выйти';
        loginBtn.onclick = () => auth.signOut();
    } else {
        loginBtn.textContent = 'Войти';
        loginBtn.onclick = () => loginModal.style.display = "block";
    }
});

// Добавьте стили для карточек
const styles = `
    .event-card, .post-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        margin: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .event-card img, .post-card img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
