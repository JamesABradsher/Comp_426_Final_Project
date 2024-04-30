import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {Task} from './task.mjs';
import {User} from './user.mjs';

// Express App parameters 
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cookieParser())


//// Express App functions for creating a new user and logging in an existing user ////
app.post('/login', (req, res) => {
    let uname = req.body.username;
    let pas = req.body.password; // get username and password from request
    try{
        let foundUser = User.getUserList().find((user) => user.getUsername()==uname&&user.matchPassword(pas));
    }catch(error){
        let foundUser = undefined;
    }
    if (foundUser == undefined){
        res.status(400).send("Bad login attempt");
        return;
    }
    else if(foundUser.getSessionVal()!=0){
        res.status(400).send("Someone else is logged in");
        return;
    }
    else{ // if a user exists with that login info
        let val = Math.random()+1;
        res.cookie(uname,val); // plant a cookie (maybe I should make the cookie value something other than a random number; revisit this later)
        foundUser.setSessionVal(val); // I'm assuming the user has a "session value" that is set whenever a client logs in. 
        // This value is known only to the user that logged in most recently and should be nonzero only when someone is logged in.
        res.json(true);
    }
});


app.post('/logout',(req,res) =>{
    let uname = req.body.username;
    let pas = req.body.password; // get uname and password from request
    const cookies = req.cookies; // gets the cookies held by the client
    let val = cookies[uname];
    try{
        let foundUser = User.getUserList().find((user) => user.getUsername()==uname&&user.matchPassword(pas));
    }catch(error){
        let foundUser = undefined;
    }
    if (foundUser == undefined){
        res.status(400).send("Bad logout attempt");
        return;
    }
    else if(foundUser.getSessionVal()!=val){
        res.status(400).send("Client is not logged in");
        return;
    }else{
        foundUser.setSessionVal(0);
        res.json(true);
    }
});


app.post('/newacct', (req, res) => {
    let uname = req.body.username;
    let pas = req.body.password; // get uname and password from request
    User.create({username: uname, password: pas});  
});


//// Express App functions for getting and modifying a user's tasks ////
app.get('/tasks', (req, res) => {
    /* Get all tasks of a user. Gets a JSON object containing a list of Task objects. 
    The username currently logged in is passed into req.cookie. Search for that user in the User class,  */

    /// STEP 1: GETTING USER 
    // In req.cookie (make sure that is defined), get the username of the user who sent the request. Also get the corresponding session val
    // First, see if the username provided corresponds with a valid user
    // let currUser = User.getUserByUsername(username) // to get the current user object
    // If the user exists, make sure that the user is logged in (session val != 0) and that the session val in the cookie matches the User instance's session val
    // If the username exists, and the session val is valid, then proceed:

    const cookies = req.cookies;
    if(req.cookies === undefined){
        res.status(400).send("POST Failed - req.cookies is undefined");
        return;
    }

    let clientUser; // will hold the queried User object
    for (const cookieName in cookies){ // check each cookie to see if information matches a user
        // Check if the username matches an existing username and that that userame's User object's sessionVal is valid 
        clientUser = User.getUserList().find((user) => (user.getUsername()==cookieName&&user.getSessionVal()==cookies[cookieName]));    
        if(clientUser){
            break;
        }
    }
    
    if(!clientUser){
        // Deny request because client is not logged in or user does not exist
        res.status(400).send("POST Failed - User does not exist or user is not logged in");
        return;
    }

    /// STEP 2 - Get the User's list of tasks
    let taskList = clientUser.getTaskList(); 
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
    const cookies = req.cookies;
    if(req.cookies === undefined){
        res.status(400).send("POST Failed - req.cookies is undefined");
        return;
    }

    let clientUser; // will hold the queried User object
    for (const cookieName in cookies){ // check each cookie to see if information matches a user
        // Check if the username matches an existing username and that that userame's User object's sessionVal is valid 
        clientUser = User.getUserList().find((user) => (user.getUsername()==cookieName&&user.getSessionVal()==cookies[cookieName]));    
        if(clientUser){
            break;
        }
    }
    
    if(!clientUser){
        // Deny request because client is not logged in or user does not exist
        res.status(400).send("POST Failed - User does not exist or user is not logged in");
        return;
    }

    /// STEP 2: CREATE A NEW TASK FOR EACH TASK IN THE LIST
    // Get the request body containing a list of JSON objects
    let tasksList = req.body;
    if(!tasksList){
        res.status(400).send("POST Failed - Tasks list is undefined");
        return;
    }

    let taskObjects = []; // will hold the instances of all newly created Task objects
    for(let i = 0; i < tasksList.length; i++){
        // Get the current task's JSON object. Create a new task instance using this information called newTask
        let taskTitle = tasksList[i].taskTitle; // string, nonempty
        let taskDue = tasksList[i].taskDue; // string, can be empty or in format YYYY-MM-DD 
        let taskIsComplete = tasksList[i].taskIsComplete; // boolean
        let taskIsStarred = tasksList[i].taskIsStarred; // boolean

        // Check each argument as being valid 
        if(taskTitle === undefined || typeof taskTitle != 'string' || taskTitle.length <= 0){
            // If any conditions fail, return an error code
            res.status(400).send("POST Failed - taskTitle is invalid (undefined, not a string, or empty string)");
            return;
        }

        if(taskDue === undefined || typeof taskDue != 'string'){
            res.status(400).send("POST Failed - taskDue is invalid (undefined or not a string)");
            return;
        }

        if(taskIsComplete === undefined || typeof taskIsComplete != 'boolean'){
            res.status(400).send("POST Failed - taskIsComplete is invalid (undefined or not a boolean)");
            return;
        }

        if(taskIsStarred === undefined || typeof taskIsStarred != 'boolean'){
            res.status(400).send("POST Failed - taskIsStarred is invalid (undefined or not a boolean)");
            return;
        }

        // Arguments are all valid past this point --> Create the new task instance 
        let newTask = Task.createTask(taskTitle, taskDue, taskIsComplete, taskIsStarred);

        if(!newTask){
            res.status(400).send("POST Failed - Task construction failed");
            return;
        } else {
            taskObjects.push(newTask)
        }
    }

    /// STEP 3: ADD ALL TASKS TO THE USER
    clientUser.setTaskList(taskObjects);

    res.status(201).send("POST Successful");
})


/// Start the express webapp on port //
app.listen(port, () => {
    console.log('Running Task Manager Backend...');
})