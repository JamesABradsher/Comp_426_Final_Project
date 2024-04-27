// Generate a random date in YYYY-MM-DD format
function getRandomDate() {
    const startDate = new Date(1995, 5, 16); // APOD started on June 16, 1995
    const endDate = new Date(); // Current date
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);
    const year = randomDate.getFullYear();
    const month = String(randomDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(randomDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const apiKey = 'a7ncInkadSLGaeZFahONPQTtCCecYZflc16pRxVx'; // Replace 'YOUR_API_KEY' with your actual NASA API key
const randomDate = getRandomDate();
const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${randomDate}`;

// Fetch APOD image
fetch(apodUrl)
    .then(response => response.json())
    .then(data => {
        const background = document.getElementById('background');
        background.style.backgroundImage = `url('${data.hdurl}')`;
    })
    .catch(error => {
        console.error('Error fetching APOD:', error);
    });

// To-Do List functionality
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date');
const todoList = document.getElementById('todos');
const completedList = document.getElementById('completed-todos');
const completedContainer = document.getElementById('completed-todos-container');
const addBtn = document.getElementById('add-btn');

function createTodoItem(text, dueDate) {
    const todoItem = document.createElement('li');
    todoItem.className = 'todo-item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'complete-checkbox';
    const todoText = document.createElement('span');
    todoText.className = 'todo-text';
    todoText.textContent = text;
    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoText);
    if (dueDate) {
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'due-date';
        dueDateSpan.textContent = dueDate;
        todoItem.appendChild(dueDateSpan);
    }
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&#10060;';
    todoItem.appendChild(deleteBtn);
    return todoItem;
}


function addTodo() {
    const todoText = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    if (todoText !== '') {
        const todoItem = createTodoItem(todoText, dueDate);
        todoList.appendChild(todoItem);
        todoInput.value = '';
        dueDateInput.value = '';
    }
}

// Function to save the to-do list to localStorage
function saveTodos() {
    const todos = Array.from(todoList.children).map(todo => ({
        text: todo.querySelector('.todo-text').textContent,
        dueDate: todo.querySelector('.due-date') ? todo.querySelector('.due-date').textContent : null,
        completed: todo.querySelector('.complete-checkbox').checked
    }));
    const completedTodos = Array.from(completedList.children).map(todo => ({
        text: todo.querySelector('.todo-text').textContent,
        dueDate: todo.querySelector('.due-date') ? todo.querySelector('.due-date').textContent : null,
        completed: true
    }));
    const allTodos = todos.concat(completedTodos);
    localStorage.setItem('todos', JSON.stringify(allTodos));
}

// Function to load the to-do list from localStorage
function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.forEach(todo => {
        const todoItem = createTodoItem(todo.text, todo.dueDate);
        const checkbox = todoItem.querySelector('.complete-checkbox');
        checkbox.checked = todo.completed;
        if (todo.completed) {
            completedList.appendChild(todoItem);
        } else {
            todoList.appendChild(todoItem);
        }
    });
}

// Load todos on page load
loadTodos();

// To-Do List functionality (continued)
addBtn.addEventListener('click', function() {
    addTodo();
    saveTodos();
});

todoList.addEventListener('change', function(event) {
    const target = event.target;
    if (target.classList.contains('complete-checkbox')) {
        const todoItem = target.parentElement;
        if (target.checked) {
            todoItem.classList.add('completed');
            completedList.appendChild(todoItem);
        } else {
            todoItem.classList.remove('completed');
            todoList.appendChild(todoItem);
        }
        saveTodos();
    }
});

todoList.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('delete-btn')) {
        const todoItem = target.parentElement;
        todoItem.remove();
        saveTodos();
    }
});

completedList.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('delete-btn')) {
        const todoItem = target.parentElement;
        todoItem.remove();
        saveTodos();
    }
    saveTodos();
});

todoInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
});

// Ensure completed tasks
completedContainer.addEventListener('change', function(event) {
    const target = event.target;
    if (target.classList.contains('complete-checkbox')) {
        const todoItem = target.parentElement;
        if (!target.checked) {
            todoItem.classList.remove('completed');
            todoList.appendChild(todoItem);
        }
    }
    saveTodos();
});


const wapiKey = '43gPLQSlS7Y95HyFUC6b6PLYT1KEPJ1Y';
const latitude = '35.913200';
const longitude = '-79.055847';
const forecastUrl = `https://api.tomorrow.io/v4/timelines?location=${latitude},${longitude}&fields=temperature&units=imperial&apikey=${wapiKey}`;

function fetchWeatherForecast() {
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            const dailyForecasts = data.data.timelines[0].intervals.slice(0, 6); // Change 7 to 5 for 5-day forecast
            let currentDate = new Date();

            const forecastContainer = document.getElementById('forecast');
            dailyForecasts.forEach((forecast, index) => {
                const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: data.timezone });
                const temperature = forecast.values.temperature;

                const forecastElement = document.createElement('div');
                forecastElement.innerHTML = `${dayOfWeek}: ${temperature}°F`;
                forecastContainer.appendChild(forecastElement);

                currentDate.setDate(currentDate.getDate() + 1); // Increment date by one day
            });
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

function canMakeApiCall() {
    const lastApiCallTimestamp = localStorage.getItem('lastApiCallTimestamp');
    if (!lastApiCallTimestamp) {
        localStorage.setItem('lastApiCallTimestamp', Date.now().toString());
        return true;
    }
    
    const oneHourInMillis = 60 * 60 * 1000;
    const elapsedTimeSinceLastApiCall = Date.now() - parseInt(lastApiCallTimestamp);
    if (elapsedTimeSinceLastApiCall >= oneHourInMillis) {
        localStorage.setItem('lastApiCallTimestamp', Date.now().toString());
        return true;
    }

    return false;
}

if (canMakeApiCall()) {
    fetchWeatherForecast();
} else {
    console.log('API call skipped. Limit reached.');
}






