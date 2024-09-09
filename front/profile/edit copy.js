const token = localStorage.getItem('authToken');
console.log("Token:", token);  // Вывод токена в консоль

const headers = {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
};

let originalBirthDate;

// Функция для загрузки данных пользователя и отображения в форме
function loadUserProfile() {
    fetch('http://46.38.96.230:8000/api/colleagues/me', { headers })
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

            // Заполняем данные об образовании
            document.getElementById('university').textContent = user.characteristic.university || 'Не указан';
            document.getElementById('diploma').textContent = user.characteristic.diplomas.length > 0 ? user.characteristic.diplomas.map(diploma => diploma.name).join(', ') : 'Не указан';
            document.getElementById('courses').textContent = user.characteristic.courses.length > 0 ? user.characteristic.courses.map(course => course.name).join(', ') : 'Не указаны';

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
    datePicker.setAttribute('readonly', true); // Устанавливаем атрибут readonly
});

// Функция для переключения в режим редактирования
function editProfile() {
    document.getElementById('jobTitle').style.display = 'none';
    document.getElementById('status').style.display = 'none'; // Добавляем эту строку для скрытия статуса

    const profileInfo = document.querySelectorAll('.profile-info div span');
    profileInfo.forEach(span => {
        if (span.id === 'status') {
            document.getElementById('statusSelect').style.display = 'inline';    
            document.getElementById('statusSelect').value = span.textContent.trim();
        } else if (span.id === 'jobTitle') {
            document.getElementById('jobTitleSelect').style.display = 'inline';
            document.getElementById('jobTitleSelect').value = span.textContent.trim();
        } else if (span.id !== 'birthDate') {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = span.textContent === 'Не указано' || span.textContent === 'Не указана' ? '' : span.textContent;
            input.id = span.id;
            span.replaceWith(input);
        }
    });

    document.getElementById('birthDatePicker').removeAttribute('readonly');
    document.getElementById('openDatePickerButton').style.display = 'inline'; // Показать кнопку выбора даты
    const editButton = document.getElementById('editButton');
    editButton.classList.remove('edit-profile-button');
    editButton.classList.add('save-profile-button');
    editButton.onclick = saveUserProfile;
}

// Функция для сохранения отредактированных данных
function saveUserProfile() {
    const updatedUser = {
        fio: document.getElementById('fullName').value,
        status: document.getElementById('statusSelect').value, // Используем выбранное значение
        telephone_number: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        job_title: document.getElementById('jobTitleSelect').value,
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

    fetch('http://46.38.96.230:8000/api/colleagues/me/', {
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

// Функция для переключения в режим редактирования образования
function editEducation() {
    const educationInfo = document.querySelectorAll('.education-info div span');
    educationInfo.forEach(span => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent === 'Не указан' || span.textContent === 'Не указаны' ? '' : span.textContent;
        input.id = span.id; // Сохраняем тот же ID
        span.replaceWith(input);
    });

    const editButton = document.getElementById('editButtonEducation');
    editButton.classList.remove('edit-profile-button');
    editButton.classList.add('save-profile-button');
    editButton.textContent = '';
    editButton.onclick = saveEducation;
}

function saveEducation() {
    // Собираем данные из формы
    const university = document.getElementById('university').value.trim();
    const diplomasInput = document.getElementById('diploma').value.trim();
    const coursesInput = document.getElementById('courses').value.trim();

    // Проверяем, заполнены ли поля
    const updatedEducation = {};

    if (university) {
        updatedEducation.university = university;
    }

    if (diplomasInput) {
        // Разбиваем введенные данные на массивы по запятой
        const diplomas = diplomasInput.split(',').map(name => ({ name: name.trim() }));
        updatedEducation.diplomas = diplomas;
    }

    if (coursesInput) {
        // Разбиваем введенные данные на массивы по запятой
        const courses = coursesInput.split(',').map(name => ({ name: name.trim() }));
        updatedEducation.courses = courses;
    }

    console.log('Sending request with:');
    console.log('URL:', 'http://46.38.96.230:8000/api/colleagues/me/');
    console.log('Headers:', headers);
    console.log('Body:', JSON.stringify({ characteristic: updatedEducation }));

    fetch('http://46.38.96.230:8000/api/colleagues/me/', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ characteristic: updatedEducation })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Failed to update profile');
            });
        }
        alert('Образование успешно обновлено');
        location.reload();
    })
    .catch(error => {
        console.error('Ошибка при обновлении образования:', error);
    });
}

// Загружаем данные пользователя при загрузке страницы
window.onload = loadUserProfile;
