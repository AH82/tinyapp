const express = require("express");
var cookieParser = require('cookie-parser'); // replaced by cookie-session
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["theKey"/* secret keys */],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const PORT = 8080; // default port 8080

/** 
 * The body-parser library will convert the request body from a Buffer into string that we can read. 
 * It will then add the data to the req(request) object under the key body.
 */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Function to generate random strings (unique) to create shortURLs IDs
function generateRandomString(length) {
// NOTE : the code has been looked over on the internet, the comments are mine (Hatem) though.
// length: is how many characters 
var text = "";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; //all possible/wanted letters to include
 
for (var i = 0; i < length; i++) 
  text += possible.charAt(Math.floor(Math.random() * possible.length)); // random # between 0-1, multiplied by the number of possible characters -> rounded then character at this position, then pushed into the string.
 
return text;
}


// setting "view engine" from Express's default "jade" , to "ejs" (Embedded JavaScript) 
app.set("view engine", "ejs");

// database of tinyApp URLs | key: value => shortURL: longURL
// W3D3 : UPDATE : database now have property's values as (sub) URL-objects with longURL and userID as keys
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

// USERS OBJECT / DATABASE
// Database updated to reflect bcrypt changes.
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
    
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
    
  }
};
/* // This is the old Database before bcrypt
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
 */
// HELPER FUNCTION : returns true if user email exists.
const userEmailDuplicateChecker = function(email) {
  for (let user in users) {
    console.log('*** userEmailDuplicateChecker ***\n ', user);
    if (users[user].email === email) {
      console.log('I\'m inside the IF in the email checker!')
      return true;
    } else return false;
  }
};

// HELPER FUNCTION : takes user email and returns his ID
const getUserByEmail = function(email, userDatabseObj) {
  for (let user in userDatabseObj) {
    if (userDatabseObj[user].email === email) {
      console.log('HELPER FUNCTION getUserByEmail 1: Return is user = ', userDatabseObj[user].id);
      console.log('HELPER FUNCTION getUserByEmail 2: Return is user = ', user);
      return userDatabseObj[user].id;
    }
  }
};

// HELPER FUNCTION : returns true if password corresponding to an email is found.
const userPasswordchecker = function(email, password) {
  
  if (users[getUserByEmail(email, users)]) {
    const hashedPassword = users[getUserByEmail(email, users)].password;
    console.log('hashed password from  function userPasswordchecker = ', hashedPassword)
    if (bcrypt.compareSync(password, hashedPassword)) {
      return true;
    }
/*  // old code when the password was text. passwords now are bcrypted   
    if (users[getUserByEmail(email)].password === password) {
        return true;
    } */
  } else return false;
};

// HELPER FUNCTION : returns the URLs where the userID is equal to the id of the currently logged in user.
const urlsForUser = function(id) {
  //presumeably this will take it from the cookie
  const userURLs = {}
  for ( let shortURL in urlDatabase) { 
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  // console.log(userURLs);
  return userURLs;
}

// Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
/**
 * NOTE-TO-SELF : the reason "templeteVars" is used in each is the scope, they are not scene bu other "app.get()"s 
 * Also, I can send any objects I desire , each object sent to path is treated per page 
 * pay attention to the Path/route arg for app.get(arg, whatever) *  
 * */ 

// LOGIN / GET :
app.get("/login", (req, res) => {

  let templateVars = {
    // user : users[req.cookies["user_id"]]
    user : users[req.session.user_id]
  };
  console.log("this is the app.get login : req.session.user_id = ",req.session.user_id)
  console.log("this is the app.get login : users[req.session.user_id] = ",users[req.session.user_id])
  console.log("this is the app.get login : users = ",users)
  res.render("users_login", templateVars);
} );

// LOGIN / POST :  Takes username from form input., Now email instead.
app.post("/login", (req, res) => {
  // users[getUserByEmail(req.body.email)]; // this was a bug. kept for reference.y
  
  // Checks if the login fields are empty
  if ( !(req.body.email && req.body.password) ) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : Empty email or password`);
    res.end("400 Bad request: Empty email or password");
  }

  // the following part checks both email and password at the same time 2-in-1. why? security! (ok ok and less work)
  else if(userEmailDuplicateChecker(req.body.email) !== true && userPasswordchecker(req.body.email, req.body.password) !== true)  {
    res.statusCode = 403;
    console.log(`statusCode : ${res.statusCode} Bad request : email does not exist`);
    res.end("403 forbidden or invalid request : email does not exist or wrong password");
  } 
  
  else {
  console.log('---\nFROM INSIDE POST LOGIN : \nuser id is :' + getUserByEmail(req.body.email, users) + '\nbody password is : ' + req.body.password + '\n---\n');
  // res.cookie("user_id", getUserByEmail(req.body.email));
  req.session.user_id = getUserByEmail(req.body.email, users);

  console.log("FROM APP.POST LOGIN : getUserByEmail(req.body.email, users) = ", getUserByEmail(req.body.email, users));
  console.log("FROM APP.POST LOGIN : req.session.user_id = ", req.session.user_id)
  res.redirect("/urls");
  }
});

// -- LOG OUT ROUTE --
app.post("/logout", (req, res) => {
  //delete the cookie (_)
  // res.clearCookie('username');
  req.session.user_id = null;
  // res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req,res) => {
  let templateVars = {
    user : users[req.cookies["user_id"]]
  };
  res.render("users_register", templateVars);
});

// USER REGISTRATION //  QUESTION : status 
app.post("/register", (req,res) => {
  if ( !req.body.email ) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : Empty email`);
    res.end("400 Bad request: Empty email");
  } else if(userEmailDuplicateChecker(req.body.email) === true) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : email already exists`);
    res.end("400 Bad request : email already exists");
  } else {
      // console.log(req.body)
    user_ID = generateRandomString(8);
      // console.log("all good : random id gen");
    users[user_ID] = {};
      // console.log("all good : users")
    users[user_ID].id = user_ID;
      // console.log("all good : user ID")
    users[user_ID].email = req.body.email;
    // PASSWORD HASHING : 
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log('hashed password from registration = ', hashedPassword)
    users[user_ID].password = hashedPassword;
    // users[user_ID].password = req.body.password;
      // email = req.body.email
      // password = req.body.password
      // console.log(users);
    // res.cookie("user_id", user_ID);
    req.session.user_id = user_ID;
      // console.log("Cookie set!")
    res.redirect("/urls");
      // console.log("redirected? ")
  }
});
// req.session.user_id

app.get("/urls", (req, res) => {
  // if (!req.cookies["user_id"]) {
  console.log('FROM app.get /urls .. req.session.user_id = ',req.session.user_id)
  if (!req.session.user_id) {
    // res.redirect("/login");
    // setTimeout(res.redirect("/login"), 1000);
    res.end("Please Login to view your URLs or register to create some new ones");
  } else {
    let templateVars = { 
      // user : users[req.cookies["user_id"]],
      user : users[req.session.user_id],
      // user : users[req.cookies["user_id"]],
      // username: req.cookies["username"],
      // urls: urlDatabase 
      // urls: urlsForUser(req.cookies["user_id"])
      urls: urlsForUser(req.session.user_id)
    };
    // console.log("cookie value : ", req.cookies["user_id"])
    // console.log("urls: ", urls);
    res.render("urls_index", templateVars);
  }
});

// code to be inserted before the /:id (a.k.a. :shortURL) // order matters!
// reason: if placed after, Express will think /new is an :id , 
//          but if this one has precedence (placed before), Express will know to treat it regularely (not ID).
app.get("/urls/new", (req, res) => {
  // console.log(req.cookies["user_id"]);
  // if (!req.cookies["user_id"]){
  if (!req.session.user_id){
    res.redirect("/login");
  } else {
    let templateVars = {
      // user : users[getUserByEmail(req.body.email)],
      // user : users[req.cookies["user_id"]]//,
      user : users[req.session.user_id]//,
     // username: req.cookies["user_id"]
    };
    res.render("urls_new", templateVars);
  }
});

// this following function is mentioned in the learning modules as :id instead of :shortURL -- I think.
// AKA: /urls/:id
app.get("/urls/:shortURL", (req, res) => {
  // let userURLsObj = urlsForUser(req.cookies["user_id"]);
  let userURLsObj = urlsForUser(req.session.user_id);
  // if (!req.cookies["user_id"]) {
  if (!req.session.user_id) {
    // setTimeout(res.redirect("/login"), 3000);
    res.end("Please Login to view your URLs or register to create some new ones");
  } else if ( !userURLsObj[req.params.shortURL] ) {
    // if the the URL with the matching :id does not belong to them.
    res.end("Sorry! You do not have the proper clearance to view this  URL");
  } else {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    // longURL:  urlDatabase[req.params.shortURL] ,
    longURL:  userURLsObj[req.params.shortURL] ,
    // username: req.cookies["username"],
    // user : users[req.cookies["user_id"]]
    user : users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
  }
}); 

// POSTs the form (in urls_new) to /URLs
app.post("/urls", (req, res) => {
  console.log('Console is now in app.post("/urls".. :\n',req.body);  // Log the POST request body to the console
  //call string random generation function for shortURL.
  let randomString = generateRandomString(6);

  // commit the changes in the urlDatabase object.
  console.log('randomString := ', randomString)       // TEST
  console.log('urlDatabase BEFORE :', urlDatabase);   // TEST
  // 2020-02-23 : POTENTIAL BUG DISCOVERED : urlDatabase was not updated here / Bug is here indeed
  // urlDatabase[randomString] = req.body.longURL; // old code
  urlDatabase[randomString] = {};
  urlDatabase[randomString]["longURL"] = req.body.longURL;
  // urlDatabase[randomString]["userID"] = req.cookies["user_id"];
  urlDatabase[randomString]["userID"] = req.session.user_id;
  // 2020-02-23 : POTENTIAL BUG DISCOVERED ^ : END OF FIX
  console.log('urlDatabase AFTER', urlDatabase);      // TEST
  // NOTE ^^^ : object key added apparently without quotes, so be careful if this is needed later for JSON files.


  // instead of "OK", respond with a redirect - to new page showing the link they created
  //- to /urls/:shortURL, where shortURL is the random string we generated.
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect("/urls/"+randomString);
  // res.location();
});
/* app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL:  urlDatabase[req.params.shortURL]  };
  res.render("urls_show", templateVars);
});  */

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // const longURL = urlsForUser[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // let userURLsObj = urlsForUser(req.cookies["user_id"]);
  let userURLsObj = urlsForUser(req.session.user_id);
  // if (!req.cookies["user_id"]) {
  if (!req.session.user_id) {
    // res.redirect("/login");
    res.end("Either you do not have the proper clearance to edit or Delete or you are not Logged in.\nPlease Login to view, edit or delete your URLs or register to create some new ones :)\n");
  // } else if ( !userURLsObj[req.params.shortURL] ) {
  //   // if the the URL with the matching :id does not belong to them.
  //   res.end("Sorry! You do not have the proper clearance to view this  URL");
  } else {
  console.log(urlDatabase)
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase)
  res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  // let userURLsObj = urlsForUser(req.cookies["user_id"]);
  let userURLsObj = urlsForUser(req.session.user_id);
  console.log(userURLsObj);
  // if (!req.cookies["user_id"]) {
  if (!req.session.user_id) {
    // res.redirect("/login");
    res.end("Either you do not have the proper clearance to edit or Delete or you are not Logged in.\nPlease Login to view, edit or delete your URLs or register to create some new ones :)\n");
  // } else if ( !userURLsObj[req.params.shortURL] ) {
  //   // if the the URL with the matching :id does not belong to them.
  //   res.end("Sorry! You do not have the proper clearance to view this  URL");
  } else {
  // res.send("hey! I'm on a dummy Edit page!")
  // 2020-02-23 : BUG DISCOEVERED : urlDatabase wasn't updated with correct input format : FIXED.
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id}; // the line forgot : the actual line that updates this Short URL . (you dummy) 
  // urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/"+shortURL);
}
});
