const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

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

// HELPER FUNCTION : returns true if user email exists.
const userEmailDuplicateChecker = function(email) {
  for (let user in users) {
    console.log('*** userEmailDuplicateChecker ***\n ', user);
    if (users[user].email === email) {
      console.log('I\'m inside the IF !')
      return true;
    } else return false;
  }
};

// HELPER FUNCTION : takes user email and returns his ID
const emailToUserId = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      console.log(' *** emailToUserId *** \n    ', users[user].id);
      return users[user].id;
    }
  }
};

// HELPER FUNCTION : returns true if password corresponding to an email is found.
const userPasswordchecker = function(email, password) {
  if (users[emailToUserId(email)]) {
    if (users[emailToUserId(email)].password === password) {
        return true;
    }
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
 *                Also, I can send any objects I desire , each object sent to path is treated per page 
 *                pay attention to the Path/route arg for app.get(arg, whatever) *  
 * */ 

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
    // setTimeout(res.redirect("/login"), 1000);
    res.end("Please Login to view your URLs or register to create some new ones");
  } else {
    let templateVars = { 
      user : users[req.cookies["user_id"]],
      // user : users[req.cookies["user_id"]],
      // username: req.cookies["username"],
      // urls: urlDatabase 
      urls: urlsForUser(req.cookies["user_id"])
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
  if (!req.cookies["user_id"]){
    res.redirect("/login");
  } else {
    let templateVars = {
      // user : users[emailToUserId(req.body.email)],
      user : users[req.cookies["user_id"]]//,
     // username: req.cookies["user_id"]
    };
    res.render("urls_new", templateVars);
  }
});

// this following function is mentioned in the learning modules as :id instead of :shortURL -- I think.
// AKA: /urls/:id
app.get("/urls/:shortURL", (req, res) => {
  let userURLsObj = urlsForUser(req.cookies["user_id"]);
  if (!req.cookies["user_id"]) {
    setTimeout(res.redirect("/login"), 3000);
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
    user : users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
  }
}); 

// POSTs the form (in urls_new) to /URLs
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  //call string random generation function for shortURL.
  let randomString = generateRandomString(6);

  // commit the changes in the urlDatabase object.
  console.log('randomString := ', randomString)       // TEST
  console.log('urlDatabase BEFORE :', urlDatabase);   // TEST
  urlDatabase[randomString] = req.body.longURL;
  console.log('urlDatabase AFTER', urlDatabase);      // TEST
  // NOTE ^^^ : object key added apparently without quotes, so be careful if this is needed later for JSON files.


  // instead of "OK", respond with a redirect - to new page showing the link they created
  //- to /urls/:shortURL, where shortURL is the random string we generated.
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
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
  let userURLsObj = urlsForUser(req.cookies["user_id"]);
  if (!req.cookies["user_id"]) {
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
  let userURLsObj = urlsForUser(req.cookies["user_id"]);
  if (!req.cookies["user_id"]) {
    // res.redirect("/login");
    res.end("Either you do not have the proper clearance to edit or Delete or you are not Logged in.\nPlease Login to view, edit or delete your URLs or register to create some new ones :)\n");
  // } else if ( !userURLsObj[req.params.shortURL] ) {
  //   // if the the URL with the matching :id does not belong to them.
  //   res.end("Sorry! You do not have the proper clearance to view this  URL");
  } else {
  // res.send("hey! I'm on a dummy Edit page!")
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL; // the line forgot : the actual line that updates this Short URL . (you dummy) 
  res.redirect("/urls/"+shortURL);
}
});
// LOGIN / GET :
app.get("/login", (req, res) =>{
  let templateVars = {
    user : users[req.cookies["user_id"]]
  };
  res.render("users_login", templateVars);
} );

// LOGIN / POST :  Takes username from form input., Now email instead.
app.post("/login", (req, res) => {
  // users[emailToUserId(req.body.email)]; // this was a bug. kept for reference.

  // the following if-statement checks if email or password fields are empty. idea stolen from /register.
  console.log("---USER LOGIN DETAILS ---");
  console.log('EMAIL: ', req.body.email);
  console.log('PASSWORD: ',req.body.password);

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
  } else {
  console.log('FROM INSIDE POST LOGIN',emailToUserId(req.body.email));
  res.cookie("user_id", emailToUserId(req.body.email));
  res.redirect("/urls");
  }
});

// -- LOG OUT ROUTE --
app.post("/logout", (req, res) => {
  //delete the cookie (_)
  // res.clearCookie('username');
  res.clearCookie('user_id');
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
    users[user_ID].password = req.body.password;  
      // email = req.body.email
      // password = req.body.password
      // console.log(users);
    res.cookie("user_id", user_ID);
      // console.log("Cookie set!")
    res.redirect("/urls");
      // console.log("redirected? ")
  }
});