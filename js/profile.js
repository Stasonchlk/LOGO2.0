// Инициализация Firebase
const db = firebase.database();
const usersRef = db.ref('users');

// Функция инициализации профиля
function initProfile() {
    const currentUser  = getCurrentUser ();
    if (!currentUser ) {
        console.error('Пользователь не авторизован');
        return;
    }

    // Получение элемента интерфейса для отображения профиля
    const profileContainer = document.getElementById('profileContainer');
    if (!profileContainer) return;

    // Слушатель изменений в базе данных
    usersRef.child(currentUser .uid).on('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            displayUser Profile(userData);
        } else {
            console.error('Данные пользователя не найдены');
        }
    });

    // Инициализация кнопки редактирования профиля
    const editProfileButton = document.getElementById('editProfileButton');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', showEditProfileForm);
    }
}

// Функция отображения профиля пользователя
function displayUser Profile(user) {
    const profileContainer = document.getElementById('profileContainer');
    profileContainer.innerHTML = `
        <h2>${user.name}</h2>
        <p>Email: ${user.email}</p>
        <p>Дата регистрации: ${new Date(user.registrationDate).toLocaleDateString()}</p>
        <p>О себе: ${user.bio || 'Нет информации'}</p>
        <img src="${user.profileImage || 'default-profile.png'}" alt="Profile Image" class="profile-image">
    `;
}

// Функция показа формы редактирования профиля
function showEditProfileForm() {
    const currentUser  = getCurrentUser ();
    if (!currentUser ) {
        alert('Необходимо войти в систему');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Редактировать профиль</h2>
            <form id="editProfileForm">
                <input type="text" id="editName" placeholder="Имя" required>
                <input type="email" id="editEmail" placeholder="Email" required>
                <textarea id="editBio" placeholder="О себе"></textarea>
                <input type="file" id="editProfileImage" accept="image/*">
                <div class="form-actions">
                    <button type="submit">Сохранить</button>
                    <button type="button" onclick="closeModal()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);

    // Заполнение формы текущими данными пользователя
    populateEditProfileForm(currentUser .uid);

    document.getElementById('editProfileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        updateProfile(currentUser .uid);
    });
}

// Функция заполнения формы редактирования профиля
function populateEditProfileForm(userId) {
    usersRef.child(userId).once('value', (snapshot) => {
        const user = snapshot.val();
        if (user) {
            document.getElementById('editName').value = user.name || '';
            document.getElementById('editEmail').value = user.email || '';
            document.getElementById('editBio').value = user.bio || '';
        }
    });
}

// Функция обновления профиля
async function updateProfile(userId) {
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const profileImageFile = document.getElementById('editProfileImage').files[0];

    try {
        // Обновление данных пользователя в базе данных
        await usersRef.child(userId).update({ name, email, bio });

        // Если загружено новое изображение профиля, загрузить его
        if (profileImageFile) {
            const imageUrl = await uploadProfileImage(profileImageFile);
            await usersRef.child(userId).update({ profileImage: imageUrl });
        }

        closeModal();
        alert('Профиль успешно обновлен!');
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        alert('Произошла ошибка при обновлении профиля');
    }
}

// Функция загрузки изображения профиля
async function uploadProfileImage(file) {
    const storageRef = firebase.storage ().ref();
    const imageRef = storageRef.child(`profile_images/${Date.now()}_${file.name}`);
    await imageRef.put(file);
    return await imageRef.getDownloadURL();
}

// Функция закрытия модального окна
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Вспомогательные функции
function getCurrentUser () {
    return firebase.auth().currentUser;
}
