## To-Do List Web Application

This project is a simple to-do list web application that allows users to add, complete, and delete tasks. It also provides a weather forecast for the next 5 days using the Tomorrow.io Weather API. Additionally, the background of the application is dynamically set using the NASA Astronomy Picture of the Day (APOD) API.
### Features

- Add Task: Users can add tasks to the to-do list by entering a task description and, optionally, a due date.
- Complete Task: Tasks can be marked as completed by checking a checkbox next to the task. Completed tasks are moved to a separate completed tasks list.
- Delete Task: Tasks can be deleted from the to-do list or the completed tasks list by clicking a delete button next to the task.
- Weather Forecast: The application displays a 6-day weather forecast for the user's location. The forecast includes the day of the week and the temperature in Fahrenheit.
- Background Image: The background of the application is dynamically set to a random image from a random day in the NASA Astronomy Picture of the Day (APOD) archive. Each time the page is reloaded, a new image is chosen from a random day.
### Technologies Used

- HTML/CSS/JavaScript: The front-end of the application is built using HTML, CSS, and JavaScript.
- LocalStorage: The application uses the browser's LocalStorage to store the to-do list items, allowing them to persist across sessions.
- Tomorrow.io Weather API: The application uses the Tomorrow.io Weather API to fetch weather forecasts for the next 5 days.
- NASA APOD API: The application uses the NASA Astronomy Picture of the Day (APOD) API to fetch daily images for the background.
### Usage
1 - Clone the repository to your local machine.
2 - Open index.html in a web browser to use the application.
3 - Enter a task description in the input field and, optionally, a due date.
4 - Click the "Add" button to add the task to the to-do list.
5 - Check the checkbox next to a task to mark it as completed.
6 - Click the delete button next to a task to delete it from the list.
#### Note
API Rate Limit: The Tomorrow.io Weather API has a rate limit of 25 requests per hour. Ensure that you do not exceed this limit.

____________
- NASA API Key - a7ncInkadSLGaeZFahONPQTtCCecYZflc16pRxVx
- weather api - 43gPLQSlS7Y95HyFUC6b6PLYT1KEPJ1Y
- I used Chat gbt to help with the coding
- OpenAI. (2024). ChatGPT (3.5) [Large language model]. https://chat.openai.com