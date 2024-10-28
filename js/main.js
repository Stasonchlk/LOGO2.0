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
const eventsContainer = document.getElementById('eventsContainer');
const postsContainer = document.getElementById('postsContainer');

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

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', () => {
    loadPosts(); // Загружаем посты при загрузке страницы
});

// Обработка состояния авторизации
auth.onAuthStateChanged((user) => {
    if (user) {
        // Пользователь вошел
    } else {
        // Пользователь не вошел
    }
});
