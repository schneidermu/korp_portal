document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
        console.error('No auth token found. Please log in.');
        window.location.href = '/login'; // Redirect to login page if no token
        return;
    }

    const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
    };

    // Получение текущего пользователя
    fetch('http://46.38.96.230:8000/api/colleagues/me', { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(user => {
            const username = user.username;
            fetchPolls(username, headers);
        })
        .catch(error => {
            console.error('Ошибка при получении пользователя:', error);
            if (error.message === 'Unauthorized') {
                alert('Your session has expired. Please log in again.');
                window.location.href = '/login'; // Redirect to login page
            }
        });
});

function fetchPolls(username, headers) {
    fetch('http://46.38.96.230:8000/api/polls/', { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => createPolls(data.results, username, headers))
        .catch(error => {
            console.error('Ошибка при получении опросов:', error);
            if (error.message === 'Unauthorized') {
                alert('Your session has expired. Please log in again.');
                window.location.href = '/login'; // Redirect to login page
            }
        });
}

function createPolls(polls, username, headers) {
    const newsSection = document.querySelector('.news'); 
    if (!newsSection) return; 

    const pollContainer = document.createElement('div');
    pollContainer.classList.add('poll-container');

    polls.forEach(poll => {
        const pollElement = document.createElement('div');
        pollElement.classList.add('poll');

        const questionText = document.createElement('p');
        questionText.textContent = poll.question_text;
        pollElement.appendChild(questionText);

        const selectedChoice = poll.choices.find(choice => choice.who_voted.includes(username));

        poll.choices.forEach(choice => {
            const choiceElement = document.createElement('div');
            choiceElement.classList.add('choice');
            const choiceText = document.createElement('label');
            const isChecked = selectedChoice && selectedChoice.id === choice.id ? 'checked' : '';
            const isDisabled = selectedChoice ? 'disabled' : '';

            choiceText.innerHTML = `<input type="radio" name="choice-${poll.id}" value="${choice.id}" ${isChecked} ${isDisabled}> ${choice.choice_text}`;
            choiceElement.appendChild(choiceText);

            pollElement.appendChild(choiceElement);
        });

        pollContainer.appendChild(pollElement);
    });

    newsSection.appendChild(pollContainer); 

    // Add event listeners to the dynamically created radio buttons
    document.querySelectorAll('.choice input[type="radio"]').forEach(input => {
        input.addEventListener('change', function() {
            const pollId = this.name.replace('choice-', '');
            const choiceId = this.value;
            submitPollChoice(pollId, choiceId, headers);
        });
    });
}

function submitPollChoice(pollId, choiceId, headers) {
    const data = {
        poll_id: pollId,
        choice_id: choiceId
    };

    fetch('http://46.38.96.230:8000/api/polls/vote/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit choice');
        }
        return response.json();
    })
    .then(data => {
        console.log('Poll choice submitted successfully:', data);
        localStorage.setItem(`poll-${pollId}`, choiceId);
        disablePoll(pollId);
        showSelectedChoice(choiceId);
    })
    .catch(error => {
        console.error('Error submitting poll choice:', error);
    });
}

function disablePoll(pollId) {
    document.querySelectorAll(`input[name="choice-${pollId}"]`).forEach(input => {
        input.disabled = true;
    });
}

function showSelectedChoice(choiceId) {
    document.querySelector(`input[value="${choiceId}"]`).checked = true;
}

