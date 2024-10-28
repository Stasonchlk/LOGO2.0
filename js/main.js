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

// Функции для работы с модальным окном
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

document.getElementById('postsButton').addEventListener('click', function() {
    // Здесь должен быть код для перехода к окну постов
    window.location.href = 'posts.html'; // Пример перехода на страницу постов
});

// Обработка формы входа
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            closeLoginModal();
            alert('Успешный вход!');
        })
        .catch((error) => {
            alert('Ошибка входа: ' + error.message);
        });
});

// Загрузка постов
function loadPosts() {
    const postsRef = database.ref('posts');
    postsRef.on('value', (snapshot) => {
        postsContainer.innerHTML = ''; // Очистка контейнера перед добавлением новых постов
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

// Загрузка мероприятий
function loadEvents() {
    const bannersRef = database.ref('banners');
    bannersRef.on('value', (snapshot) => {
        eventsContainer.innerHTML = ''; // Очистка контейнера перед добавлением новых мероприятий
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

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', () => {
    loadPosts(); // Загружаем посты при загрузке страницы
    loadEvents(); // Загружаем мероприятия при загрузке страницы
});

// Обработка состояния авторизации
auth.onAuthStateChanged((user) => {
    if (user) {
        loginBtn.textContent = 'Выйти';
        loginBtn.onclick = () => {
            auth.signOut().then(() => {
                loginBtn.textContent = 'Войти';
                loginBtn.onclick = openLoginModal;
            });
        };
    } else {
        loginBtn.textContent = 'Войти';
        loginBtn.onclick = openLoginModal;
    }
});
