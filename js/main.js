// Инициализация Firebase
const firebaseConfig = {
  // Здесь нужно вставить конфигурацию вашего Firebase проекта
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// Глобальные переменные
let currentUser = null;

// Функция для проверки аутентификации
function checkAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      document.body.classList.add('authenticated');
      updateUIForAuthenticatedUser();
    } else {
      currentUser = null;
      document.body.classList.remove('authenticated');
      updateUIForUnauthenticatedUser();
    }
  });
}

// Функция для обновления UI для аутентифицированного пользователя
function updateUIForAuthenticatedUser() {
  const authButtons = document.querySelectorAll('.auth-button');
  authButtons.forEach(button => {
    button.style.display = 'none';
  });
  
  const userInfo = document.getElementById('user-info');
  if (userInfo) {
    userInfo.textContent = `Привет, ${currentUser.displayName || currentUser.email}!`;
    userInfo.style.display = 'block';
  }
  
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.style.display = 'block';
  }
}

// Функция для обновления UI для неаутентифицированного пользователя
function updateUIForUnauthenticatedUser() {
  const authButtons = document.querySelectorAll('.auth-button');
  authButtons.forEach(button => {
    button.style.display = 'block';
  });
  
  const userInfo = document.getElementById('user-info');
  if (userInfo) {
    userInfo.style.display = 'none';
  }
  
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.style.display = 'none';
  }
}

// Функция для входа в систему
function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Вход выполнен успешно
      const user = userCredential.user;
      console.log("Вход выполнен успешно:", user);
    })
    .catch((error) => {
      // Обработка ошибок
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Ошибка входа:", errorCode, errorMessage);
      alert("Ошибка входа: " + errorMessage);
    });
}

// Функция для регистрации
function register() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Регистрация выполнена успешно
      const user = userCredential.user;
      console.log("Регистрация выполнена успешно:", user);
    })
    .catch((error) => {
      // Обработка ошибок
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Ошибка регистрации:", errorCode, errorMessage);
      alert("Ошибка регистрации: " + errorMessage);
    });
}

// Функция для выхода из системы
function logout() {
  firebase.auth().signOut()
    .then(() => {
      console.log("Выход выполнен успешно");
    })
    .catch((error) => {
      console.error("Ошибка выхода:", error);
    });
}

// Инициализация приложения
function init() {
  checkAuth();
  
  // Добавление обработчиков событий для кнопок
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', login);
  }
  
  const registerButton = document.getElementById('register-button');
  if (registerButton) {
    registerButton.addEventListener('click', register);
  }
  
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
}

// Запуск инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
