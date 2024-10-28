// Инициализация базы данных Firebase
const db = firebase.database();
const postsRef = db.ref('posts');

// Функция инициализации постов
function initPosts() {
    // Получение контейнера для постов
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    // Инициализация фильтров
    initFilters();

    // Слушатель изменений в базе данных
    postsRef.on('value', (snapshot) => {
        // Очистка контейнера
        postsContainer.innerHTML = '';
        
        let posts = [];
        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            post.id = childSnapshot.key;
            posts.push(post);
        });

        // Сортировка постов по дате (новые сверху)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Отображение постов
        posts.forEach(post => {
            const postCard = createPostCard(post);
            postsContainer.appendChild(postCard);
        });
    });

    // Инициализация кнопки создания поста
    const createPostButton = document.getElementById('createPostButton');
    if (createPostButton) {
        createPostButton.addEventListener('click', showCreatePostForm);
    }
}

// Функция инициализации фильтров
function initFilters() {
    const filterToggleButton = document.getElementById('filterToggleButton');
    const titleFilter = document.getElementById('titleEditText');
    const dateFilter = document.getElementById('dateEditText');
    const keywordsFilter = document.getElementById('keywordsEditText');
    const filterButton = document.getElementById('filterButton');

    if (filterToggleButton) {
        filterToggleButton.addEventListener('click', () => {
            const filters = document.querySelectorAll('.filter-input');
            filters.forEach(filter => {
                filter.style.display = filter.style.display === 'none' ? 'block' : 'none';
            });
        });
    }

    if (filterButton) {
        filterButton.addEventListener('click', () => {
            applyFilters(titleFilter.value, dateFilter.value, keywordsFilter.value);
        });
    }
}

// Функция применения фильтров
function applyFilters(title, date, keywords) {
    const posts = document.querySelectorAll('.post-card');
    posts.forEach(post => {
        const postTitle = post.querySelector('.post-title').textContent.toLowerCase();
        const postDate = post.querySelector('.post-date').textContent.toLowerCase();
        const postKeywords = post.querySelector('.post-keywords').textContent.toLowerCase();

        const matchesTitle = !title || postTitle.includes(title.toLowerCase());
        const matchesDate = !date || postDate.includes(date.toLowerCase());
        const matchesKeywords = !keywords || postKeywords.includes(keywords.toLowerCase());

        post.style.display = matchesTitle && matchesDate && matchesKeywords ? 'block' : 'none';
    });
}

// Функция создания карточки поста
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    card.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${post.title}</h3>
            <span class="post-date">${formatDate(post.date)}</span>
        </div>
        <div class="post-content">
            <img src="${post.imageUrl}" alt="${post.title}" class="post-image">
            <p class="post-description">${post.description}</p>
            <p class="post-keywords">${post.keywords}</p>
        </div>
        <div class="post-actions">
            ${getCurrentUser() && getCurrentUser().uid === post.userId ? 
                `<button onclick="deletePost('${post.id}')" class="delete-button">Удалить</button>` : ''}
            <button onclick="likePost('${post.id}')" class="like-button">
                ❤️ ${post.likes ? Object.keys(post.likes).length : 0}
            </button>
        </div>
    `;

    return card;
}

// Функция показа формы создания поста
function showCreatePostForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Создание поста</h2>
            <form id="createPostForm">
                <input type="text" id="postTitle" placeholder="Заголовок" required>
                <textarea id="postDescription" placeholder="Описание" required></textarea>
                <input type="text" id="postKeywords" placeholder="Ключевые слова (через запятую)" required>
                <input type="file" id="postImage" accept="image/*" required>
                <div class="form-actions">
                    <button type="submit">Создать</button>
                    <button type="button" onclick="closeModal()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('createPostForm').addEventListener('submit', createPost);
}

// Функция создания нового поста
async function createPost(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Необходимо войти в систему');
        return;
    }

    try {
        // Получение данных формы
        const title = document.getElementById('postTitle').value;
        const description = document.getElementById('postDescription').value;
        const keywords = document.getElementById('postKeywords').value;
        const imageFile = document.getElementById('postImage').files[0];

        // Загрузка изображения
        const imageUrl = await uploadPostImage(imageFile);

        // Создание нового поста в базе данных
        const newPost = {
            title,
            description,
            keywords,
            imageUrl,
            userId: currentUser.uid,
            date: new Date().toISOString(),
            likes: {}
        };

        await postsRef.push(newPost);
        closeModal();
        alert('Пост успешно создан!');
    } catch (error) {
        console.error('Ошибка при создании поста:', error);
        alert('Произошла ошибка при создании поста');
    }
}

// Функция загрузки изображения поста
async function uploadPostImage(file) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`posts/${Date.now()}_${file.name}`);
    await imageRef.put(file);
    return await imageRef.getDownloadURL();
}

// Функция удаления поста
async function deletePost(postId) {
    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        try {
            await postsRef.child(postId).remove();
            alert('Пост успешно удален');
        } catch (error) {
            console.error('Ошибка при удалении поста:', error);
            alert('Произошла ошибка при удалении поста');
        }
    }
}

// Функция лайка поста
async function likePost(postId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Необходимо войти в систему');
        return;
    }

    try {
        const postRef = postsRef.child(postId).child('likes');
        const likesSnapshot = await postRef .once('value');
        const likes = likesSnapshot.val();

        if (likes && likes[currentUser.uid]) {
            await postRef.child(currentUser.uid).remove();
        } else {
            await postRef.child(currentUser.uid).set(true);
        }
        await postsRef.child(postId).child('likes').transaction((count) => count + 1);
        alert('Пост успешно лайкнут!');
    } catch (error) {
        console.error('Ошибка при лайке поста:', error);
        alert('Произошла ошибка при лайке поста');
    }
}

// Функция форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Функция получения текущего пользователя
function getCurrentUser() {
    return firebase.auth().currentUser;
}
