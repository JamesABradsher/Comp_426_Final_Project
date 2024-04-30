import express from 'express';
import bodyParser from 'body-parser';
import {User} from './user.mjs';


const app = express();

const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser())

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

/*
// CODE FOR EXTRACTING USER FROM CLIENT REQUEST


const cookies = req.cookies;
for (const cookieName in cookies){ // check each cookie to see if information matches a user
    let clientUser = User.getUserList().find((user) => (user.getUsername()==cookieName&&user.getSessionVal()==cookies[cookieName]));    
    if(clientUser){
        break;
    }
}
if(!clientUser){
    // Deny request because client is not logged in
}
*/