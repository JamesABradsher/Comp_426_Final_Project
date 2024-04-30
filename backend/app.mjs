import express from 'express';
import bodyParser from 'body-parser';
import { User } from './user.mjs';

const app = express();

const port = 3000;

app.use(bodyParser.json());


/** RESTful commands not necessarily final, mostly just for testing purposes */


// Gets List of Users
app.get('/users', (req, res) => {
    res.json(User.getUserList());
});

// Gets list of Tasks in ordered array
app.get('/user/:id/tasks', (req, res) => {
    let user = User.getUser(parseInt(req.params.id));
    let session_data = getSessionData();
    if (!user || session_data.username != user.getUsername() || session_data.sessionVal != user.getSessionVal()) {
        res.status(400).send("User Not Valid");
        return;
    }
    res.json(user.getTaskList());
});

// Creates a new user
app.post('/user', (req, res) => {
    let user = User.create(req.body);
    if (!user) {
        res.status(400).send("Data Invalid");
        return;
    }
    res.status(201).json(user.json());
});

// Creates a new task for a given user
app.post('/user/:id/task', (req, res) => {
    let user = User.getUser(parseInt(req.params.id));
    let session_data = getSessionData();
    if (!user || session_data.username != user.getUsername() || session_data.sessionVal != user.getSessionVal()) {
        res.status(400).send("User Not Valid");
        return;
    }

    let task = user.addTask(req.body);
    if (!task) {
        res.status(400).send("Task Data Invalid");
        return;
    }

    res.status(201).json(task);
});

// Updates the specified tasks data
app.put('/user/:u_id/task/:t_id', (req, res) => {
    let user = User.getUser(parseInt(req.params.u_id));
    let session_data = getSessionData();
    if (!user || session_data.username != user.getUsername() || session_data.sessionVal != user.getSessionVal()) {
        res.status(400).send("User Not Valid");
        return;
    }

    let task = user.getTaskById(parseInt(req.params.t_id))
    if (!task) {
        res.status(400).send("Task Not Found");
        return;
    }

    task.update(req.body);
});

// Deletes Specified task
app.delete('/user/:u_id/task/:t_id', (req, res) => {
    let user = User.getUser(parseInt(req.params.u_id));
    let session_data = getSessionData();
    if (!user || session_data.username != user.getUsername() || session_data.sessionVal != user.getSessionVal()) {
        res.status(400).send("User Not Valid");
        return;
    }

    res.status(201).json(user.removeTask(parseInt(req.params.t_id)));
});

// Moves the specified task up one position in the task list
app.put('/user/:u_id/task/:t_id/promote', (req, res) => {
    let user = User.getUser(parseInt(req.params.u_id));
    let session_data = getSessionData();
    if (!user || session_data.username != user.getUsername() || session_data.sessionVal != user.getSessionVal()) {
        res.status(400).send("User Not Valid");
        return;
    }

    user.promoteTask(parseInt(req.params.t_id));
});

// Moves the specified task down one position in the task list
app.put('/user/:u_id/task/:t_id/demote', (req, res) => {
    let user = User.getUser(parseInt(req.params.u_id));
    let session_data = getSessionData();
    if (!user || session_data.username != user.getUsername() || session_data.sessionVal != user.getSessionVal()) {
        res.status(400).send("User Not Valid");
        return;
    }

    user.demoteTask(parseInt(req.params.t_id));
});

// Toggles whether the specified task is starred/flagged
app.put('/user/:u_id/task/:t_id/star', (req, res) => {
    let user = User.getUser(parseInt(req.params.u_id));
    let session_data = getSessionData();
    if (!user || session_data.username != user.getUsername() || session_data.sessionVal != user.getSessionVal()) {
        res.status(400).send("User Not Valid");
        return;
    }

    let task = user.getTaskById(parseInt(req.params.t_id))
    if (!task) {
        res.status(400).send("Task Not Found");
        return;
    }

    user.flagTask(parseInt(req.params.t_id), !task.isFlagged());
});

app.listen(port, () => {
    console.log('Running...');
})