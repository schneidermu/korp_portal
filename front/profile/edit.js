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
    document.getElementById('status').style.display = 'none';
    document.getElementById('birthDate').style.display = 'none';
    document.getElementById('telephone').style.display = 'none';

    const profileInfo = document.querySelectorAll('.profile-info div span');
    profileInfo.forEach(span => {
        if (span.id === 'status') {
            document.getElementById('statusSelect').style.display = 'inline';    
            document.getElementById('statusSelect').value = span.textContent.trim();
        } else if (span.id === 'birthDate') {
            document.getElementById('birthDatePicker').style.display = 'inline';
            document.getElementById('birthDatePicker').value = span.textContent.trim() === 'Не указана' ? '' : span.textContent.trim();
            document.getElementById('openDatePickerButton').style.display = 'inline';
        } else if (span.id === 'telephone') {
            document.getElementById('telephoneInput').style.display = 'inline';
            document.getElementById('telephoneInput').value = span.textContent.trim() === 'Не указан' ? '' : span.textContent.trim();
        } else if (span.id === 'jobTitle') {
            document.getElementById('jobTitleSelect').style.display = 'inline';
            document.getElementById('jobTitleSelect').value = span.textContent.trim() === 'Не указана' ? '' : span.textContent.trim();
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = span.textContent === 'Не указано' || span.textContent === 'Не указана' ? '' : span.textContent;
            input.id = span.id;
            input.className = 'styled-input'; // Присвоим класс для стиля
            span.replaceWith(input);
        }
    });

    document.getElementById('birthDatePicker').removeAttribute('readonly');
    const editButton = document.getElementById('editButton');
    editButton.classList.remove('edit-profile-button');
    editButton.classList.add('save-profile-button');
    editButton.onclick = saveUserProfile;
}

function saveUserProfile() {
    // Логика сохранения данных
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


// Открыть диалог для выбора нового аватара
function openAvatarUpload() {
    document.getElementById('uploadAvatar').click(); // Открывает окно выбора файла
}

// Предварительный просмотр выбранного аватара
function previewAvatar(event) {
    const input = event.target;
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            document.getElementById('profileAvatar').src = e.target.result; // Показать превью
        }

        reader.readAsDataURL(file); // Прочитать файл и преобразовать в URL
    }
}

// Логика для сохранения изображения на сервере
function saveProfile() {
    const uploadAvatarInput = document.getElementById('uploadAvatar');
    const file = uploadAvatarInput.files[0];

    const formData = new FormData();

    if (file) {
        formData.append('avatar', file); // Добавляем файл в форму данных
    }

    fetch('http://46.38.96.230:8000/api/colleagues/me/', {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer <your-token>', // Укажите ваш токен, если требуется
        },
        body: formData // Отправляем данные
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Failed to update profile');
            });
        }
        alert('Изображение успешно обновлено');
        location.reload(); // Перезагружаем страницу
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
        input.id = span.id;
        input.className = 'styled-input'; // Добавляем класс для стилизации
        span.replaceWith(input);
    });

    const editButton = document.getElementById('editButtonEducation');
    editButton.classList.remove('edit-profile-button');
    editButton.classList.add('save-profile-button');
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
        const courses = coursesInput.split(',').map(name => ({ name: name.trim()}));
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
                // Функция для переключения в режим редактирования карьеры
                function editCareer() {
                    const careerInfo = document.querySelectorAll('.career-info div span');
                    careerInfo.forEach(span => {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = span.textContent === 'Не указан' || span.textContent === 'Не указано' ? '' : span.textContent;
                        input.id = span.id; // Сохраняем тот же ID
                        input.className = 'styled-input'; // Добавляем класс для стилизации
                        span.replaceWith(input);
                    });
                
                    // Показываем кнопку "Добавить" и таблицу
                    document.getElementById('careerTable').hidden = false;
                    document.getElementById('addCareerRow').style.display = 'inline-block';
                
                    // Меняем текст на "Сохранить"
                    const editButton = document.getElementById('editCareerButton');
                    editButton.classList.remove('edit-profile-button');
                    editButton.classList.add('save-profile-button');
                    editButton.onclick = saveCareer;
                }
                

                function saveCareer() {
                    const experienceInput = document.getElementById('experience').value.trim();
                    const skillsInput = document.getElementById('skills').value.trim();
                    const trainingInput = document.getElementById('training').value.trim();
                
                    const updatedCareer = {};
                
                    // Преобразование значения experience в число
                    if (experienceInput) {
                        const experienceNumber = Number(experienceInput);
                        if (!isNaN(experienceNumber)) {
                            updatedCareer.experience = experienceNumber;
                        } else {
                            console.error('Invalid experience value:', experienceInput);
                            alert('Введите правильное число для опыта.');
                            return; // Прекращаем выполнение, если значение некорректное
                        }
                    }
                
                    if (skillsInput) {
                        const skills = skillsInput.split(',').map(name => ({ name: name.trim() }));
                        updatedCareer.skills = skills;
                    }
                
                    if (trainingInput) {
                        const training = trainingInput.split(',').map(name => ({ name: name.trim() }));
                        updatedCareer.training = training;
                    }
                
                    console.log('Sending request with:');
                    console.log('URL:', 'http://46.38.96.230:8000/api/colleagues/me/');
                    console.log('Headers:', headers);
                    console.log('Body:', JSON.stringify({ characteristic: updatedCareer }));
                
                    fetch('http://46.38.96.230:8000/api/colleagues/me/', {
                        method: 'PUT',
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ characteristic: updatedCareer })
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => {
                                console.error('Error response:', text); // Логируем текст ошибки
                                throw new Error(text || 'Failed to update career');
                            });
                        }
                        alert('Карьера успешно обновлено');
                        location.reload();
                    })
                    .catch(error => {
                        console.error('Ошибка при обновлении карьеры:', error);
                        alert('Произошла ошибка при обновлении карьеры. Проверьте консоль для деталей.');
                    });
                }
                function addCareerRow() {
                    const tableBody = document.querySelector('#careerTable tbody');
                    
                    // Создаем новую строку таблицы
                    const row = tableBody.insertRow();
                    
                    // Создаем ячейки для года начала и окончания, а также должности
                    const cell1 = row.insertCell(0);
                    const cell2 = row.insertCell(1);
                    
                    cell1.innerHTML = `
                        <select class="year-select" onchange="updateEndYearOptions(this)">
                            <option value="">С</option>
                            ${generateYearOptions()}
                        </select>
                        <select class="year-select">
                            <option value="">По</option>
                            <option value="current">н. вр.</option>
                            ${generateYearOptions()}
                        </select>
                    `;
                    cell2.innerHTML = `<input type="text" placeholder="Должность">`;
                }
                function generateYearOptions() {
                    const currentYear = new Date().getFullYear();
                    const maxYear = 2024;
                    let options = '';
                    for (let year = currentYear - 50; year <= maxYear; year++) {
                        options += `<option value="${year}">${year}</option>`;
                    }
                    return options;
                }
                function updateEndYearOptions(selectElement) {
                    const startYear = parseInt(selectElement.value, 10);
                    const endSelect = selectElement.nextElementSibling;
                    
                    const options = generateYearOptions()
                        .split('</option>')
                        .map(option => option + '</option>')
                        .filter(option => {
                            const yearMatch = option.match(/value="(\d+)"/);
                            if (yearMatch) {
                                const year = parseInt(yearMatch[1], 10);
                                return year >= startYear || isNaN(startYear);
                            }
                            return false;
                        })
                        .join('');

                    endSelect.innerHTML = `
                        <option value="">По</option>
                        <option value="current">н. вр.</option>
                        ${options}
                    `;
                }
                // Функция для редактирования поля "Обо мне"
function editAboutMe() {
    const aboutMeText = document.getElementById('aboutMeText');
    const textContent = aboutMeText.textContent.trim();

    // Создаём текстовое поле для редактирования
    const input = document.createElement('textarea');
    input.value = textContent === 'Не указано' ? '' : textContent;
    input.id = 'aboutMeInput';
    input.className = 'styled-input'; // Используем предоставленный класс для стилизации
    aboutMeText.replaceWith(input);

    const editButton = document.getElementById('editAboutMeButton');
    editButton.classList.remove('edit-profile-button');
    editButton.classList.add('save-profile-button');
    editButton.onclick = saveAboutMe;
}

// Функция для сохранения изменений
function saveAboutMe() {
    const input = document.getElementById('aboutMeInput');
    const updatedAboutMe = input.value.trim();

    // Обновляем интерфейс с новым значением
    const p = document.createElement('p');
    p.id = 'aboutMeText';
    p.textContent = updatedAboutMe ? updatedAboutMe : 'Не указано';
    input.replaceWith(p);

    const editButton = document.getElementById('editAboutMeButton');
    editButton.classList.remove('save-profile-button');
    editButton.classList.add('edit-profile-button');
    editButton.onclick = editAboutMe;

    // Отправляем данные на сервер
    fetch('http://46.38.96.230:8000/api/colleagues/me/', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ aboutMe: updatedAboutMe })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Failed to update profile');
            });
        }
        alert('Информация "Обо мне" успешно обновлена');
        location.reload();
    })
    .catch(error => {
        console.error('Ошибка при обновлении информации "Обо мне":', error);
    });
}
function rateStar(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Загружаем данные пользователя при загрузке страницы
window.onload = loadUserProfile;
