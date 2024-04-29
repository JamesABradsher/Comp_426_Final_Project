import express from 'express';
import bodyParser from 'body-parser';
import { User } from './user.mjs';

const app = express();

const port = 3000;

app.use(bodyParser.json());


/** RESTful commands not necessarily final, mostly just for testing purposes */


/** 
 * After some thinking, i think a better way to handle the urls 
 * would be to have whatever final app.mjs we come up with 
 * store the user's id after authentication, then the urls can just reference 
 * task id's but we can get around to that later
 */

app.get('/users', (req, res) => {
    res.json(User.getUserList());
});

app.get('/user/:id/tasks', (req, res) => {
    let user = User.getUser(parseInt(req.params.id))
    if (!user) {
        res.status(400).send("Not Found");
        return;
    }
    res.json(user.getTaskIds());
});

app.post('/user', (req, res) => {
    let user = User.create(req.body);
    if (!user) {
        res.status(400).send("Data Invalid");
        return;
    }
    res.status(201).json(user.json());
});

app.post('/user/:id/task', (req, res) => {
    let user = User.getUser(parseInt(req.params.id));
    if (!user) {
        res.status(400).send("User Not Found");
        return;
    }

    let task = user.addTask(req.body);
    if (!task) {
        res.status(400).send("Task Data Invalid");
        return;
    }

    res.status(201).json(task);
});

app.listen(port, () => {
    console.log('Running...');
})