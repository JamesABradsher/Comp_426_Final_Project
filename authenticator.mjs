import express from 'express';
import bodyParser from 'body-parser';
import {User} from './user.mjs';


const app = express();

const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser())

app.put('/login', (req, res) => {
    let id = req.query.id;
    let pas = req.query.password; // get id and password from request
    try{
        let foundUser = User.getUserList().find((user) => user.getId()==id&&user.getPassword()==pas);
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
        res.cookie(id,val); // plant a cookie (maybe I should make the cookie value something other than a random number; revisit this later)
        foundUser.setSessionVal(val); // I'm assuming the user has a "session value" that is set whenever a client logs in. 
        // This value is known only to the user that logged in most recently and should be nonzero only when someone is logged in.
        res.json(true);
    }

    
    
    
});
app.put('/logout',(req,res) =>{
    let id = req.query.id;
    let pas = req.query.password; // get id and password from request
    const cookies = req.cookies; // gets the cookies held by the client
    let val = cookies[id];
    try{
        let foundUser = User.getUserList().find((user) => user.getId()==id&&user.getPassword()==pas);
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
app.put('/newacct', (req, res) => {
    let id = req.query.id;
    let pas = req.query.password; // get id and password from request
    User.getUserList().push(new User(id,pas)); // This syntax might be redundant and/or missing arguments.
    
    
});