// Количество уровней
const totalLevels = 3; // Пока что 3 уровня для тестирования

// Прогресс игрока (сохранение в localStorage)
let playerProgress = JSON.parse(localStorage.getItem('playerProgress')) || {
    completedLevels: [],
    levelStars: {},
};

// Функция для сохранения прогресса
function saveProgress() {
    localStorage.setItem('playerProgress', JSON.stringify(playerProgress));
}

// Функция для генерации звезд уровней
function generateLevelStars() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h1>Добро пожаловать!</h1>
        <p>Начните свое путешествие по уровням, нажимая на доступные звезды.</p>
        <div class="levels" id="levels"></div>
    `;

    const levelsContainer = document.getElementById('levels');
    levelsContainer.innerHTML = '';

    for (let i = 1; i <= totalLevels; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.dataset.level = i;

        // Проверяем, доступен ли уровень
        if (i === 1) {
            // Первый уровень всегда доступен
            star.classList.remove('locked');
        } else {
            // Проверяем, получил ли игрок хотя бы одну звезду на предыдущем уровне
            const previousLevelStars = playerProgress.levelStars[i - 1] || 0;
            if (previousLevelStars >= 1) {
                star.classList.remove('locked');
            } else {
                star.classList.add('locked');
            }
        }

        // Добавляем обработчик события
        star.addEventListener('click', () => {
            const previousLevelStars = playerProgress.levelStars[i - 1] || 0;
            if (i === 1 || previousLevelStars >= 1) {
                loadLevel(i);
            } else {
                alert('Этот уровень пока недоступен. Получите хотя бы одну звезду на предыдущем уровне.');
            }
        });

        // Создаем элемент для отображения количества звезд за уровень
        const starCount = document.createElement('div');
        starCount.classList.add('level-stars');

        // Получаем количество звезд за этот уровень
        const starsEarned = playerProgress.levelStars[i] || 0;

        // Добавляем иконки звездочек
        for (let j = 0; j < 3; j++) {
            const starIcon = document.createElement('i');
            starIcon.classList.add('fas', 'fa-star');
            if (j < starsEarned) {
                starIcon.classList.add('earned');
            } else {
                starIcon.classList.add('not-earned');
            }
            starCount.appendChild(starIcon);
        }

        // Добавляем starCount к звездочке уровня
        star.appendChild(starCount);

        levelsContainer.appendChild(star);
    }
}

// Функция для загрузки уровня
function loadLevel(levelNumber) {
    // Загружаем данные уровня из JSON-файла
    fetch(`level${levelNumber}.json`)
        .then(response => response.json())
        .then(levelData => {
            displayLevel(levelNumber, levelData);
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных уровня:', error);
            alert('Данный уровень еще не готов.');
        });
}

// Функция для отображения уровня на странице
function displayLevel(levelNumber, levelData) {
    const mainContent = document.getElementById('main-content');

    let questionsHTML = '';

    levelData.questions.forEach((q, index) => {
        questionsHTML += `
            <div class="question">
                <p><strong>Вопрос ${index + 1}:</strong> ${q.question}</p>
                <input type="text" id="answer-${levelNumber}-${index}" placeholder="Ваш ответ">
                <span id="result-${levelNumber}-${index}"></span>
            </div>
        `;
    });

    mainContent.innerHTML = `
        <h1 class="level-title">День ${levelNumber}</h1>
        <div class="video-section">
            <h2>Видеоразбор</h2>
            <iframe src="${levelData.video}" frameborder="0" allowfullscreen></iframe>
        </div>
        <div class="test-section">
            <h2>Тестовые задания</h2>
            ${questionsHTML}
            <button onclick="checkAllAnswers(${levelNumber})" id="check-all-button">Проверить все ответы</button>
        </div>
    `;

    // После загрузки нового контента вызываем MathJax для рендеринга формул
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

// Функция для проверки всех ответов
function checkAllAnswers(levelNumber) {
    // Загружаем данные уровня из JSON-файла
    fetch(`level${levelNumber}.json`)
        .then(response => response.json())
        .then(levelData => {
            let correctAnswers = 0;

            for (let i = 0; i < levelData.questions.length; i++) {
                const userAnswer = document.getElementById(`answer-${levelNumber}-${i}`).value.trim();
                const resultSpan = document.getElementById(`result-${levelNumber}-${i}`);
                const correctAnswer = levelData.questions[i].answer;

                if (userAnswer === correctAnswer) {
                    resultSpan.textContent = 'Правильно!';
                    resultSpan.style.color = 'green';
                    correctAnswers++;
                } else {
                    resultSpan.textContent = 'Неправильно!';
                    resultSpan.style.color = 'red';
                }
            }

            // Определяем количество звездочек, которые получит игрок
            let starsEarned = correctAnswers; // 0, 1, 2 или 3

            // Сохраняем количество звездочек за уровень
            playerProgress.levelStars[levelNumber] = starsEarned;

            // Обновляем список завершенных уровней
            if (!playerProgress.completedLevels.includes(levelNumber)) {
                playerProgress.completedLevels.push(levelNumber);
            }

            // Сохраняем прогресс
            saveProgress();

            // Сообщаем игроку о результате
            alert(`Вы набрали ${starsEarned} из 3 звездочек на уровне ${levelNumber}.`);

            // Возвращаемся на главный экран
            generateLevelStars();
        })
        .catch(error => {
            console.error('Ошибка при проверке ответов:', error);
            alert('Произошла ошибка при проверке ответов.');
        });
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    generateLevelStars();
});
