// Инициализация базы данных Firebase
const db = firebase.database();
const bannersRef = db.ref('banners');

// Функция инициализации событий
function initEvents() {
    // Получение контейнера для баннеров
    const bannerContainer = document.getElementById('bannerContainer');
    if (!bannerContainer) return;

    // Слушатель изменений в базе данных
    bannersRef.on('value', (snapshot) => {
        // Очистка контейнера
        bannerContainer.innerHTML = '';
        
        snapshot.forEach((childSnapshot) => {
            const banner = childSnapshot.val();
            const bannerId = childSnapshot.key;
            
            // Создание карточки мероприятия
            const bannerCard = createBannerCard(banner, bannerId);
            bannerContainer.appendChild(bannerCard);
        });
    });

    // Инициализация кнопки создания мероприятия
    const createEventButton = document.getElementById('createEventButton');
    if (createEventButton) {
        createEventButton.addEventListener('click', showCreateEventForm);
    }
}

// Функция создания карточки мероприятия
function createBannerCard(banner, bannerId) {
    const card = document.createElement('div');
    card.className = 'banner-card';
    
    // Проверка статуса мероприятия
    const status = getEventStatus(banner.date);
    
    card.innerHTML = `
        <div class="banner-header">
            <h3>${banner.theme}</h3>
            <span class="status ${status}">${status}</span>
        </div>
        <div class="banner-content">
            <img src="${banner.imageUrl}" alt="${banner.theme}" class="banner-image">
            <p class="description">${banner.description}</p>
            <p class="participants">Участники: ${banner.participantsCount}/${banner.participants}</p>
            <p class="date">Дата: ${banner.date}</p>
            <p class="location">${banner.metka}</p>
        </div>
        <div class="banner-actions">
            ${getCurrentUser() && getCurrentUser().uid === banner.userId ? 
                `<button onclick="deleteBanner('${bannerId}')" class="delete-button">Удалить</button>` :
                `<button onclick="joinEvent('${bannerId}')" class="join-button" 
                    ${banner.participantsCount >= banner.participants ? 'disabled' : ''}>
                    Записаться
                </button>`
            }
        </div>
    `;

    // Добавление обработчика клика для перехода к деталям мероприятия
    card.addEventListener('click', (e) => {
        if (!e.target.matches('button')) {
            showEventDetails(banner, bannerId);
        }
    });

    return card;
}

// Функция определения статуса мероприятия
function getEventStatus(date) {
    const eventDate = new Date(date.split('.').reverse().join('-'));
    const currentDate = new Date();
    
    if (currentDate < eventDate) {
        return 'active';
    }
    return 'expired';
}

// Функция показа формы создания мероприятия
function showCreateEventForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Создание мероприятия</h2>
            <form id="createEventForm">
                <input type="text" id="eventTheme" placeholder="Тема" required>
                <textarea id="eventDescription" placeholder="Описание" required></textarea>
                <input type="number" id="eventParticipants" placeholder="Количество участников" required>
                <input type="date" id="eventDate" required>
                <input type="text" id="eventLocation" placeholder="Место проведения" required>
                <input type="file" id="eventImage" accept="image/*" required>
                <div class="form-actions">
                    <button type="submit">Создать</button>
                    <button type="button" onclick="closeModal()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('createEventForm').addEventListener('submit', createEvent);
}

// Функция создания нового мероприятия
async function createEvent(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Необходимо войти в систему');
        return;
    }

    try {
        // Получение данных формы
        const theme = document.getElementById('eventTheme').value;
        const description = document.getElementById('eventDescription').value;
        const participants = document.getElementById('eventParticipants').value;
        const date = document.getElementById('eventDate').value;
        const location = document.getElementById('eventLocation').value;
        const imageFile = document.getElementById('eventImage').files[0];

        // Загрузка изображения
        const imageUrl = await uploadEventImage(imageFile);

        // Создание нового мероприятия в базе данных
        const newBanner = {
            theme,
            description,
            participants,
            participantsCount: 0,
            date: formatDate(date),
            metka: location,
            imageUrl,
            userId: currentUser.uid,
            users: {}
        };

        await bannersRef.push(newBanner);
        closeModal();
        alert('Мероприятие успешно создано!');
    } catch (error) {
        console.error('Ошибка при создании мероприятия:', error);
        alert('Произошла ошибка при создании мероприятия');
    }
}

// Функция загрузки изображения мероприятия
async function uploadEventImage(file) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`events/${Date.now()}_${file.name}`);
    await imageRef.put(file);
    return await imageRef.getDownloadURL();
}

// Функция форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Функция удаления мероприятия
async function deleteBanner(bannerId) {
    if (confirm('Вы уверены, что хотите удалить это мероприятие?')) {
        try {
            await bannersRef.child(bannerId).remove();
            alert('Мероприятие успешно удалено');
        } catch (error) {
            console.error('Ошибка при удалении мероприятия:', error);
            alert('Произошла ошибка при удалении мероприятия');
        }
    }
}

// Функция записи на мероприятие
async function joinEvent(bannerId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Необходимо войти в систему');
        return;
    }

    try {
        const bannerRef = bannersRef.child(bannerId);
        const bannerSnapshot = await bannerRef.once('value');
        const banner = bannerSnapshot.val();

        if (banner.participantsCount >= banner.participants) {
            alert('К сожалению, все места уже заняты');
            return;
        }

        // Добавление пользователя к участникам
        await bannerRef.child('users').child(currentUser.uid).set(true); // true для записи
        await bannerRef.child('participantsCount').transaction((count) => count + 1);
        alert('Вы успешно записались на мероприятие!');
    } catch (error) {
        console.error('Ошибка при записи на мероприятие:', error);
        alert('Произошла ошибка при записи на мероприятие');
    }
}

// Функция показа деталей мероприятия
function showEventDetails(banner, bannerId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${banner.theme}</h2>
            <p>${banner.description}</p>
            <p>Участники: ${banner.participantsCount}/${banner.participants}</p>
            <p>Дата: ${banner.date}</p>
            <p>Место проведения: ${banner.metka}</p>
            <img src="${banner.imageUrl}" alt="${banner.theme}" class="banner-image">
            <div class="form-actions">
                <button type="button" onclick="closeModal()">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Функция закрытия модального окна
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Функция получения текущего пользователя
function getCurrentUser() {
    return firebase.auth().currentUser;
}
