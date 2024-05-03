import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {Task} from './task.mjs';
import {User} from './user.mjs';

// Express App parameters 
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());


//// Express App functions for creating a new user and logging in an existing user ////
app.put('/login', (req, res) => {
    let uname = req.body.username;
    let pas = req.body.password; // get username and password from request
    let foundUser;
    try {
        foundUser = User.getUserList().find((user) => user.getUsername() == uname && user.matchPassword(pas));
    } catch (error) {
        foundUser = undefined;
    }
    if (foundUser == undefined) {
        res.status(400).json({ success: false, error: 'Invalid username or password' });
        return;
    } else if (foundUser.getSessionVal() != 0) {
        res.status(400).json({ success: false, error: 'Someone else is logged in' });
        return;
    } else { // if a user exists with that login info
        let val = Math.random() + 1;
        foundUser.setSessionVal(val); // I'm assuming the user has a "session value" that is set whenever a client logs in.
        // This value is known only to the user that logged in most recently and should be nonzero only when someone is logged in.
        res.json({ success: true, 'val': val });
    }
});


app.post('/logout',(req,res) =>{
    const val = req.body.val;
    let foundUser = User.getUserList().find((user)=>user.getSessionVal()==val);
    if(foundUser){
        foundUser.setSessionVal(0);
    }
    res.json(true);
});


app.post('/newacct', (req, res) => {
    console.log('Received /newacct request:', req.body);
  
    let uname = req.body.username;
    let pas = req.body.password; // get uname and password from request
  
    if (!uname || !pas) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ success: false, error: 'Invalid request body' });
    }
  
    try {
      User.create({ username: uname, password: pas });
      console.log('User created:', uname);
      res.json({ success: true });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });


//// Express App functions for getting and modifying a user's tasks ////
app.get('/tasks/:val', (req, res) => {
    /* Get all tasks of a user. Gets a JSON object containing a list of Task objects. 
    The username currently logged in is passed into req.cookie. Search for that user in the User class,  */

    /// STEP 1: GETTING USER 
    // In req.cookie (make sure that is defined), get the username of the user who sent the request. Also get the corresponding session val
    // First, see if the username provided corresponds with a valid user
    // let currUser = User.getUserByUsername(username) // to get the current user object
    // If the user exists, make sure that the user is logged in (session val != 0) and that the session val in the cookie matches the User instance's session val
    // If the username exists, and the session val is valid, then proceed:
    let foundUser;
    try {
        foundUser = User.getUserList().find((user) => user.getSessionVal()==req.params.val);
    } catch (error) {
        foundUser = undefined;
    }
    if (!foundUser) {
        res.status(400).json({ success: false, error: 'Client not logged in' });
        return;
    }
    
    /// STEP 2 - Get the User's list of tasks
    let taskList = foundUser.getTaskList(); 
    res.status(201).json(taskList);
});


app.post('/tasks', (req, res) => { // Our front end just uses POST to handle POST, PUT, and DELETE functionality. 
     /* Add a list of new tasks. Request body must be a JSON object that is a list of tasks. Each task must be given with only the following fields: taskTitle (string), taskDue (string), taskIsComplete (boolean), taskIsStarred (boolean). taskTitle must be a non-empty string. Example:

    [{
        taskTitle : "COMP 426 Final Project",
        taskDue : "2024-04-30",
        taskIsComplete: false,
        taskIsStarred: true
    },
    {
        taskTitle : "Take out trash",
        taskDue : "",
        taskIsComplete: false,
        taskIsStarred: false
    }]

    Will throw a 400 status if arguments are invalid (undefined, incorrect type, or if taskTitle is an empty string). 
    */


    /// STEP 1: GETTING USER 
    // In req.cookie (make sure that is defined), get the username of the user who sent the request. Also get the corresponding session val
    // First, see if the username provided corresponds with a valid user
    // let currUser = User.getUserByUsername(username) // to get the current user object
    // If the user exists, make sure that the user is logged in (session val != 0) and that the session val in the cookie matches the User instance's session val
    // If the username exists, and the session val is valid, then proceed:
    let foundUser;
    try {
        foundUser = User.getUserList().find((user) => user.getSessionVal()==req.body.val);
    } catch (error) {
        foundUser = undefined;
    }
    if (!foundUser) {
        res.status(400).json({ success: false, error: 'Client not logged in' });
        return;
    }
    
    
    /// STEP 2: CREATE A NEW TASK FOR EACH TASK IN THE LIST
    // Get the request body containing a list of JSON objects
    let tasksList = req.body.tasks;
    if(!tasksList){
        res.status(400).json({ success: false, error: "POST Failed - Tasks list is undefined"});
        return;
    }

    let taskObjects = []; // will hold the instances of all newly created Task objects
    for(let i = 0; i < tasksList.length; i++){
        // Get the current task's JSON object. Create a new task instance using this information called newTask
        let taskTitle = tasksList[i].text; // string, nonempty
        let taskDue = tasksList[i].dueDate; // string, can be empty or in format YYYY-MM-DD 
        let taskIsComplete = tasksList[i].completed; // boolean
        let taskIsStarred = tasksList[i].starred; // boolean

        // Check each argument as being valid 
        if(taskTitle === undefined || typeof taskTitle != 'string' || taskTitle.length <= 0){
            // If any conditions fail, return an error code
            res.status(400).json({ success: false, error: "POST Failed - taskTitle is invalid (undefined, not a string, or empty string)"});
            return;
        }

        if(taskDue === undefined || typeof taskDue != 'string'){
            res.status(400).json({ success: false, error: "POST Failed - taskDue is invalid (undefined or not a string)"});
            return;
        }

        if(taskIsComplete === undefined || typeof taskIsComplete != 'boolean'){
            res.status(400).json({ success: false, error: "POST Failed - taskIsComplete is invalid (undefined or not a boolean)"});
            return;
        }

        if(taskIsStarred === undefined || typeof taskIsStarred != 'boolean'){
            res.status(400).json({ success: false, error: "POST Failed - taskIsStarred is invalid (undefined or not a boolean)"});
            return;
        }

        // Arguments are all valid past this point --> Create the new task instance 
        let newTask = Task.createTask(taskTitle, taskDue, taskIsComplete, taskIsStarred);

        if(!newTask){
            res.status(400).json({ success: false, error: "POST Failed - Task construction failed"});
            return;
        } else {
            taskObjects.push(newTask)
        }
    }

    /// STEP 3: ADD ALL TASKS TO THE USER
    foundUser.setTaskList(taskObjects);

    res.status(201).send("POST Successful");
})


/// Start the express webapp on port //
app.listen(port, () => {
    console.log('Running Task Manager Backend...');
})