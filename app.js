const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const addTaskBtn = document.getElementById('add-task-btn');
const loginBtn = document.getElementById('login-btn');
const loginContainer = document.querySelector('.login-container');
const taskContainer = document.querySelector('.task-container');
const loginError = document.getElementById('login-error');
const questionInput = document.getElementById('question-input');
const askBtn = document.getElementById('ask-btn');
const answerDisplay = document.getElementById('answer-display');

let tasks = [];
let loggedIn = false; // change to  to test login functionality

// Login functionality
loginBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username && password) {
    loginUser(username, password);
  }
});

function loginUser(username = "admin", password = "admin") {
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Login successful
        loggedIn = true;
        loginContainer.classList.add('hidden');
        taskContainer.classList.remove('hidden');
        loginError.classList.add('hidden');
        getTasks(); // Fetch tasks for the logged-in user
      } else if (data.error === 'user_not_found') {
        // User doesn't exist, create a new user
        createNewUser(username, password);
      } else {
        // Login failed for other reasons
        loginError.textContent = 'Login failed. Please check your username and password.';
        loginError.classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      loginError.textContent = 'An error occurred during login. Please try again.';
      loginError.classList.remove('hidden');
    });
  }
  

  function createNewUser(username, password) {
  fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // User creation successful, proceed with login
      loggedIn = true;
      loginContainer.classList.add('hidden');
      taskContainer.classList.remove('hidden');
      loginError.classList.add('hidden');
      getTasks(); // Fetch tasks for the logged-in user
    } else {
      // User creation failed
      loginError.classList.remove('hidden');
      loginError.textContent = data.error || 'Failed to create user';
    }
  })
  .catch(error => {
    console.error('User creation error:', error);
    loginError.classList.remove('hidden');
    loginError.textContent = 'Failed to create user';
  });
}

// Add task
addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  if (taskText) {
    const newTask = { text: taskText, dueDate, completed: false, starred: false };
    tasks.push(newTask);
    renderAndSortTasks(); // Render and sort tasks after adding
    taskInput.value = '';
    dueDateInput.value = '';
  }
});

  const completedToggle = document.getElementById('completed-toggle');
  const completedContainer = document.getElementById('completed-container');

  completedToggle.addEventListener('click', () => {
    completedContainer.classList.toggle('hidden');
  });

// Add task to the list
function addTaskToList(task) {
  const taskItem = document.createElement('li');

  // Completed checkbox
  const completedCheckbox = document.createElement('input');
  completedCheckbox.type = 'checkbox';
  completedCheckbox.checked = task.completed;
  completedCheckbox.addEventListener('change', () => {
    task.completed = completedCheckbox.checked;
    if (task.completed) {
      addTaskToCompletedList(task);
    } else {
      removeTaskFromCompletedList(task);
    }
    saveTasks();
    renderTasks();
  });

  // Star button
  const starBtn = document.createElement('button');
  starBtn.textContent = task.starred ? '★' : '☆';
  starBtn.classList.add('star-btn');
  starBtn.classList.add('clicked');
  starBtn.addEventListener('click', () => {
    task.starred = !task.starred;
    starBtn.textContent = task.starred ? '★' : '☆';
    starBtn.classList.toggle('clicked');
    renderAndSortTasks();
    saveTasks();
  });

  // Task text
   const taskText = document.createElement('span');
  taskText.textContent = task.text;
  taskText.addEventListener('click', () => {
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.value = task.description || '';
    descriptionInput.addEventListener('blur', () => {
      task.description = descriptionInput.value.trim();
      saveTasks();
    });
    taskItem.replaceChild(descriptionInput, taskText);
    descriptionInput.focus();
  });

  // Due date
  const dueDateSpan = document.createElement('span');
  dueDateSpan.textContent = `Due: ${task.dueDate}`;
  dueDateSpan.classList.add('due-date');

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => t !== task);
    saveTasks();
    renderTasks();
  });

  taskItem.appendChild(completedCheckbox);
  taskItem.appendChild(starBtn);
  taskItem.appendChild(taskText);
  taskItem.appendChild(dueDateSpan);
  taskItem.appendChild(deleteBtn);

  if (task.completed) {
    addTaskToCompletedList(task);
  } else {
    // Check if the task is starred, if so, add it to the top of the list
    const index = tasks.findIndex(t => t === task);
    if (task.starred && index > 0) {
      tasks.splice(index, 1);
      tasks.unshift(task);
      renderTasks();
    } else {
      taskList.appendChild(taskItem);
    }
  }
}

function addTaskToCompletedList(task) {
  const completedList = document.getElementById('completed-list');
  const completedItem = document.createElement('li');
  completedItem.textContent = task.text;
  completedList.appendChild(completedItem);
}

function removeTaskFromCompletedList(task) {
  const completedList = document.getElementById('completed-list');
  const completedItems = Array.from(completedList.children);
  const index = completedItems.findIndex(item => item.textContent === task.text);
  if (index !== -1) {
    completedList.removeChild(completedItems[index]);
  }
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    addTaskToList(task);
  });
}

renderTasks();

function renderAndSortTasks() {
  sortAndRenderTasks();
  saveTasks(); // Save the sorted tasks
}

// Sort and render tasks
function sortAndRenderTasks() {
  taskList.innerHTML = '';
  const completedList = document.getElementById('completed-list');
  completedList.innerHTML = '';

  // Sort tasks based on starred status and due date
  tasks.sort((a, b) => {
    // Tasks without a due date and not starred should be moved to the bottom
    if (!a.dueDate && !a.starred) return 1;
    if (!b.dueDate && !b.starred) return -1;

    // Sort by starred status first
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;

    // If both tasks are starred or both are not starred, sort by due date
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);

    // If one task has a due date and the other doesn't, prioritize the one with a due date
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });

  // Render tasks
  tasks.forEach(task => {
    if (task.completed) {
      addTaskToCompletedList(task);
    } else {
      addTaskToList(task);
    }
  });
}


// Save tasks to server
function saveTasks() {
    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tasks })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('Tasks saved successfully');
    })
    .catch(error => {
      console.error('Error saving tasks:', error);
    });
  }
  
  // Get tasks from server
  function getTasks() {
    fetch('/api/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      tasks = data.tasks;
      renderAndSortTasks();
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });
  }

//----------------------------------------------------------------------------------------------------------------------------
const newsToggle = document.getElementById('news-toggle');
const newsContainer = document.getElementById('news-container');
const newsList = document.getElementById('news-list');

// Toggle news dropdown
newsToggle.addEventListener('click', () => {
  newsContainer.classList.toggle('hidden');
  if (newsContainer.classList.contains('hidden')) {
    newsList.innerHTML = '';
  } else {
    fetchNewsHeadlines();
  }
});

// Fetch news headlines from NewsAPI
function fetchNewsHeadlines() {
  const apiKey = 'a597f6efe3a641e5b1954ea6f92f02d7'; // Replace with your actual NewsAPI key
  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'ok') {
        const articles = data.articles;
        articles.forEach(article => {
          const li = document.createElement('li');
          li.textContent = article.title;
          li.addEventListener('click', () => {
            window.open(article.url, '_blank');
          });
          newsList.appendChild(li);
        });
      } else {
        console.error('Error fetching news:', data.message);
      }
    })
    .catch(error => {
      console.error('Error fetching news:', error);
    });
}

fetchNewsHeadlines();


//----------------------------------------------------------------------------------------------------------------------------