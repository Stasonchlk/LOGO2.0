// Основная логика приложения
const app = {
    init() {
        this.loadPage('home');
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('href').substr(1);
                this.loadPage(page);
            });
        });
    },

    loadPage(page) {
        const appContainer = document.getElementById('app');
        fetch(`pages/${page}.html`)
            .then(response => response.text())
            .then(html => {
                appContainer.innerHTML = html;
                this.initPageScripts(page);
            })
            .catch(error => {
                console.error('Error loading page:', error);
                appContainer.innerHTML = '<p>Error loading page</p>';
            });
    },

    initPageScripts(page) {
        // Инициализация скриптов для конкретных страниц
        switch(page) {
            case 'events':
                this.initEvents();
                break;
            case 'posts':
                this.initPosts();
                break;
            case 'chat':
                this.initChat();
                break;
            case 'profile':
                this.initProfile();
                break;
        }
    },

    initEvents() {
        function initEvents() {
    const eventsRef = firebase.database().ref('banners');
    const eventsList = document.getElementById('events-list');
    const themeFilter = document.getElementById('theme-filter');
    const dateFilter = document.getElementById('date-filter');
    const keywordsFilter = document.getElementById('keywords-filter');

    eventsRef.on('value', (snapshot) => {
        eventsList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const event = childSnapshot.val();
            const eventElement = createEventElement(event);
            eventsList.appendChild(eventElement);
        });
    });

    [themeFilter, dateFilter, keywordsFilter].forEach(filter => {
        filter.addEventListener('input', filterEvents);
    });

    function filterEvents() {
        const theme = themeFilter.value.toLowerCase();
        const date = dateFilter.value.toLowerCase();
        const keywords = keywordsFilter.value.toLowerCase();

        Array.from(eventsList.children).forEach(eventElement => {
            const eventTheme = eventElement.querySelector('.event-theme').textContent.toLowerCase();
            const eventDate = eventElement.querySelector('.event-date').textContent.toLowerCase();
            const eventKeywords = eventElement.dataset.keywords.toLowerCase();

            const isVisible = 
                eventTheme.includes(theme) &&
                eventDate.includes(date) &&
                eventKeywords.includes(keywords);

            eventElement.style.display = isVisible ? 'block' : 'none';
        });
    }

    function createEventElement(event) {
        const element = document.createElement('div');
        element.className = 'event-item';
        element.dataset.keywords = event.keywords;
        element.innerHTML = `
            <h3 class="event-theme">${event.theme}</h3>
            <p class="event-date">${event.date}</p>
            <p>${event.description}</p>
            <img src="${event.imageUrl}" alt="${event.theme}">
            <button class="join-event" data-id="${event.id}">Присоединиться</button>
        `;
        element.querySelector('.join-event').addEventListener('click', joinEvent);
        return element;
    }

    function joinEvent(e) {
        const eventId = e.target.dataset.id;
        const userId = firebase.auth().currentUser.uid;
        firebase.database().ref(`banners/${eventId}/participants/${userId}`).set(true)
            .then(() => alert('Вы успешно присоединились к мероприятию!'))
            .catch(error => console.error('Ошибка при присоединении к мероприятию:', error));
    }
}
    },

    initPosts() {
        // Логика для страницы постов
    },

    initChat() {
        // Логика для страницы чатов
    },

    initProfile() {
        // Логика для страницы профиля
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
