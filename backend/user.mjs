import { Task } from "./task.mjs";

export class User {

    #task_list = [];
    #id;
    #username;
    #password;
    #sessionValue;
    #nextFlaggedIndex = 0;

    static next_id = 1;
    static users = [];

    /** User Construction */

    constructor(id, username, password) {
        this.#username = username;
        this.#password = password;
        this.#id = id;
        this.#sessionValue = 0;
    }

    static create(data) {
        if (data == undefined || 
            data.username == undefined || typeof data.username != 'string' ||
            data.password == undefined || typeof data.password != 'string') {
            
            return null;
        } 

        let user = new User(User.next_id++, data.username, data.password);
        User.users.push(user);
        return user;
    }


    /** Functions for interfacing with a user */

    // Static method for returning a user with the specified id
    static getUser(id) {
        if (id == undefined || typeof id != 'number') {
            return null;
        }
        return User.users.find(u => u.#id == id);
    }

    // Static method for returning array of all useres
    static getUserList() {
        return User.users.map(u => u.json());
    }

    // Updates users username and password
    // We probably dont actually need to include this functionality but I didn't think of that until after I made it
    updateUser(data) {
        if (data == undefined ||
            data.username == undefined || typeof data.username != 'string' ||
            data.password == undefined || typeof data.password != 'string') {

            return null;
        }

        this.#username = data.username;
        this.#password = data.password;
        return this;
    }

    json() {
        return {
            'id': this.#id,
            'Username': this.#username,
            'tasks': this.#task_list.map(t => t.json())
        };
    }

    getId() {
        return this.#id;
    }

    getUsername() {
        return this.#username;
    }

    // Assumed it wouldn't be good practice to provide a getter for the password
    matchPassword(pass_to_test) {
        return pass_to_test == this.#password;
    }

    setSessionVal(val) {
        this.#sessionValue = val;
    }

    getSessionVal() {
        return this.#sessionValue;
    }

    /** Functions for interfacing with tasks */

    // Adds task to task list
    addTask(data) {
        if (data == undefined) {
            return null;
        }

        let task = Task.create(data); // Assumes task has some create factory method. Also asumes Task will validate it's own data
        if (task) {
            this.#task_list.push(task);
        }
        return task;
    }

    updateTask(id, data) {
        let task = this.getTaskById(id);
        task.update(data); // Assumes task has some update function.
    }

    getTaskList() {
        return this.#task_list.map(t => t.json()); // Assumes the task have some json function
    }

    getTaskIds() {
        return this.#task_list.map(t => t.getId());
    }

    getTaskById(id) {
        if (id == undefined || typeof id != 'number') {
            return null;
        }

        return this.#task_list.find(t => t.getId() == id);
    }

    removeTask(id) {
        if (id == undefined || typeof id != 'number') {
            return null;
        }

        let task = this.#task_list.find(t => t.getId() == id);
        this.#task_list = this.#task_list.filter(t => t != task);
        return task;
    }

    /** Methods for re-ordering task list */

    #swapTasks(a, b) {
        let temp = this.#task_list[a];
        this.#task_list[a] = this.#task_list[b];
        this.#task_list[b] = temp; 
    }

    #getTaskIndex(id) {
        return this.#task_list.indexOf(this.getTaskById(id));
    }

    promoteTask(id) {
        if (this.#getTaskIndex(id) > 0 && this.#getTaskIndex(id) <= this.#task_list.length - 1) {
            this.#swapTasks(this.#getTaskIndex(id), this.#getTaskIndex(id--) );
        }
    }

    demoteTask(id) {
        if (this.#getTaskIndex(id) >= 0 && this.#getTaskIndex(id) < this.#task_list.length - 1) {
            this.#swapTasks(this.#getTaskIndex(id), this.#getTaskIndex(id++));
        }
    }

    flagTask(id, shouldFlag) {
        if (shouldFlag) {
            let index = this.#getTaskIndex(id);
            this.#swapTasks(id, this.#task_list[this.#nextFlaggedIndex++]);
            this.getTaskById(id).setFlagged(true);

            // bubbles up swapped item to top of list bc i'm lazy and dont want to think of a better way to do this
            while (index > this.#nextFlaggedIndex+1) {
                this.#swapTasks(index, --index);
            }
        } else {
            this.getTaskById(id).setFlagged(false);
            this.#nextFlaggedIndex--;
        }
    }

    
}