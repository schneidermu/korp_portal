      const token = localStorage.getItem('authToken');
        console.log("Token:", token);  // Вывод токена в консоль

        const headers = {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        };

        let originalBirthDate;

        // Функция для загрузки данных пользователя и отображения в форме
        function loadUserProfile() {
            fetch('http://25.21.178.79:8000/api/colleagues/me', { headers })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Unauthorized');
                    }
                    return response.json();
                })
                .then(user => {
                    // Заполняем поля формы текущими данными пользователя
                    document.getElementById('fullName').textContent = user.fio || 'Не указано';
                    document.getElementById('status').textContent = user.status || 'Не указано';
                    document.getElementById('birthDate').textContent = user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'Не указана';
                    document.getElementById('telephone').textContent = user.telephone_number || 'Не указан';
                    document.getElementById('email').textContent = user.email || 'Не указана';
                    document.getElementById('jobTitle').textContent = user.job_title || 'Не указана';
                    document.getElementById('classRank').textContent = user.class_rank || 'Не указан';
                    document.getElementById('structuralDivision').textContent = user.structural_division || 'Не указано';
                    document.getElementById('organization').textContent = user.organization || 'Не указано';

                    originalBirthDate = user.birth_date; // Сохраняем оригинальную дату рождения
                })
                .catch(error => {
                    console.error('Ошибка при загрузке профиля:', error);
                    if (error.message === 'Unauthorized') {
                        alert('Сеанс истек. Пожалуйста, выполните вход заново.');
                        window.location.href = '/login'; // Перенаправление на страницу входа
                    }
                });
        }
        function openDatePicker() {
            const datePicker = document.getElementById('birthDatePicker');
            datePicker.style.display = 'inline';
            datePicker.click();
            datePicker.onchange = () => {
                const selectedDate = new Date(datePicker.value);
                document.getElementById('birthDate').textContent = selectedDate.toLocaleDateString();
                datePicker.style.display = 'none';
            };
        }

        document.addEventListener('DOMContentLoaded', function() {
            var datePicker = document.getElementById('birthDatePicker');

            // Предотвращаем ручной ввод в поле ввода даты
            datePicker.addEventListener('keydown', function(event) {
                event.preventDefault();
            }, false);
        });

        // Функция для переключения в режим редактирования

// Функция для переключения в режим редактирования
function editProfile() {
    const profileInfo = document.querySelectorAll('.profile-info div span:not(#birthDate)');
    profileInfo.forEach(span => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent === 'Не указано' || span.textContent === 'Не указана' ? '' : span.textContent;
        input.id = span.id;
        span.replaceWith(input);
    });

    document.getElementById('openDatePickerButton').style.display = 'inline'; // Показать кнопку выбора даты
    const editButton = document.getElementById('editButton');
    editButton.classList.remove('edit-profile-button');
    editButton.classList.add('save-profile-button');
    editButton.textContent = '';
    editButton.onclick = saveUserProfile;
}

// Функция для отправки отредактированных данных

function saveUserProfile() {
    const updatedUser = {
        fio: document.getElementById('fullName').value,
        status: document.getElementById('status').value,
        telephone_number: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        job_title: document.getElementById('jobTitle').value,
        class_rank: document.getElementById('classRank').value,
        structural_division: document.getElementById('structuralDivision').value,
        organization: document.getElementById('organization').value
    };

    const newBirthDate = document.getElementById('birthDatePicker').value;
    if (newBirthDate) {
        updatedUser.birth_date = newBirthDate;
    } else {
        updatedUser.birth_date = originalBirthDate;
    }

    fetch('http://25.21.178.79:8000/api/colleagues/me/', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedUser)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        alert('Профиль успешно обновлен');
        location.reload(); // Перезагрузка страницы после успешного обновления
    })
    .catch(error => {
        console.error('Ошибка при обновлении профиля:', error);
    });
}

// Загружаем данные пользователя при загрузке страницы
window.onload = loadUserProfile;
