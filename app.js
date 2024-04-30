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
let loggedIn = false; // change to test login functionality

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
        loggedIn = true;
        loginContainer.classList.add('hidden');
        taskContainer.classList.remove('hidden');
        loginError.classList.add('hidden');
        getTasks(); 
      } else if (data.error === 'user_not_found') {
        createNewUser(username, password);
      } else {
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
      loggedIn = true;
      loginContainer.classList.add('hidden');
      taskContainer.classList.remove('hidden');
      loginError.classList.add('hidden');
      getTasks(); 
    } else {
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
    renderAndSortTasks();
    taskInput.value = '';
    dueDateInput.value = '';
  }
});

taskInput.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    if (taskText) {
      const newTask = { text: taskText, dueDate, completed: false, starred: false };
      tasks.push(newTask);
      renderAndSortTasks(); 
      taskInput.value = '';
      dueDateInput.value = '';
    }
  }
});

  const completedToggle = document.getElementById('completed-toggle');
  const completedContainer = document.getElementById('completed-container');
  const completedList = document.getElementById('completed-list');

  completedToggle.addEventListener('click', () => {
    console.log('Toggle button clicked');
    completedContainer.classList.toggle('hidden');
  });

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
  saveTasks(); 
}

function sortAndRenderTasks() {
  taskList.innerHTML = '';
  const completedList = document.getElementById('completed-list');
  completedList.innerHTML = '';

  tasks.sort((a, b) => {
    if (!a.dueDate && !a.starred) return 1;
    if (!b.dueDate && !b.starred) return -1;

    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;

    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);

    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });

  tasks.forEach(task => {
    if (task.completed) {
      addTaskToCompletedList(task);
    } else {
      addTaskToList(task);
    }
  });
}

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

function fetchNewsHeadlines() {
  const apiKey = 'a597f6efe3a641e5b1954ea6f92f02d7';
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
//Attestation

// I, Kameron Thomas, Used ChatGBT[1] to aid in the creation of this code, I also used the documentation and api from newsapi.org[2] to get the news headlines

// [1] OpenAI. (2024). ChatGPT (3.5) [Large language model]. https://chat.openai.com
// [2] News API. (2024). News API. https://newsapi.org