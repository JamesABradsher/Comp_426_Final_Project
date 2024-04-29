export class Task {
    #json = {};
    constructor() {
        this.#json = { 'Desc': "task json" }
    }
    static create(data) {
        console.log("Task Created")
        return new Task().json();
    }

    json() { 
        return { 'Desc': "task json"};
    }

    getId() {
        return 1;
    }
}