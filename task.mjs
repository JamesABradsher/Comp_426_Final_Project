import { networkInterfaces } from "os";

export class Task {
    // Private fields of Task instances
    #id; // int
    #taskTitle; // string
    #taskDue; // string (optional)
    #taskIsComplete; // boolean (optional)
    #taskIsStarred; // boolean (optional) 

    // Private static fields of Task class
    static #maxID = 0; 
    // the User instances encapsulate the list of all task instances

    constructor (id, taskTitle, taskDue, taskIsComplete, taskIsStarred) {
        // Will be called by createNode, which will set id and verify parameters. After construction, createNode adds the newly constructed node to #nodes.
        this.#id = id;
        this.#taskTitle = taskTitle;
        this.#taskDue = taskDue;
        this.#taskIsComplete = taskIsComplete;
        this.#taskIsStarred = taskIsStarred;
    }

    static createTask(taskTitle, taskDue, taskIsComplete, taskIsStarred){
        // app.get in app.mjs has already confirmed that all arguments are defined and of the correct time. It has not confirmed that date is valid yet.
        // However, the frontend handles sorting, so we do not need to worry about date strings.

        // Assign this task an ID
        let id = Task.#maxID;
        Task.#maxID++;

        // Create the new task
        let newTask = new Task(id, taskTitle, taskDue, taskIsComplete, taskIsStarred);

        // return the task to app.mjs so that it can be passed to User
        return newTask; 
    }

    static checkValidDate(){
        // TODO: returns true if date is of the correct format, exists, and has not already passed.
        // date will be returned from the front-end in "YYYY-MM-DD" format. This can be converted to an int with Date.parse("YYYY-MM-DD") to be used for comparison

    }

    // NOTE: No get # of tasks method in Task because we only should be able to request an authenticated User's # of tasks
    // NOTE: No get task by id method in Task because we should only be allowed to get an authenticated User's tasks

    getTaskID(){
        return this.#id;
    }

    getTaskTitle(){
        return this.#taskTitle;
    }

    getTaskDue(){
        return this.#taskDue;
    }

    getTaskIsComplete(){
        return this.taskIsComplete;
    }

    json(){
        return{
           "id" : this.#id,
           "text" : this.#taskTitle,
           "dueDate" : this.#taskDue,
           "completed" : this.#taskIsComplete,
           "starred" : this.#taskIsStarred
        }
    }
}