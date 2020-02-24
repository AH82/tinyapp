/* * * * * * * * * * * * *  * * * * * * ** * * * * * * * * * * * *
 *                                                               *
 *                    SERVER & MAIN APP FILE :                   *
 *                       express_server.js                       *
 *                                                               *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* * * * * * * * * * * FILE REQUIREMENTS * * * * * * * * * * * * */

// REQUIRE : Helper files
const {generateRandomString, findEmail, getUserByEmail, VerifyPasswordOfEmail } = require("./helpers.js");
const { urlDatabase, users } = require("./helpers_databases");

// REQUIRE : MIDDLEWARE
const express = require("express");
let cookieParser = require('cookie-parser'); // replaced by cookie-session
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// APPS , APP USEs & PORT
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

// setting "view engine" from Express's default "jade" , to "ejs" (Embedded JavaScript)
app.set("view engine", "ejs");

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 HELPER FUNCTIONS (TO MOVE LATER)                *
 *                     (if & when time aloocated)                  *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// 2020-02-23 : This helper function wasn't moved in fear to relation to a bug

// HELPER FUNCTION : returns the URLs where the userID is equal to the id of the currently logged in user.
const urlsForUser = function(id) {
  //presumeably this will take it from the cookie
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  // console.log(userURLs);
  return userURLs;
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                             ROUTES                              *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// HOMEPAGE : says Hello - no links
app.get("/", (req, res) => {
  res.send("Hello!");
});

// LISTENING PORT : --
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
/**
 * NOTE-TO-SELF :
 * "templeteVars" is in each scope, not seen by other "app.get()"s
 * Also, I can send any objects I desire , each object sent to path is treated per page
 * pay attention to the Path/route arg for app.get(arg, whatever)
 **/

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 ROUTES FOR REGISTRATION & LOGIN                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// ROUTE : LOGIN : GET
app.get("/login", (req, res) => {

  let templateVars = {
    // user : users[req.cookies["user_id"]]
    user : users[req.session.user_id]
  };
  console.log("this is the app.get login : req.session.user_id = ",req.session.user_id);
  console.log("this is the app.get login : users[req.session.user_id] = ",users[req.session.user_id]);
  console.log("this is the app.get login : users = ",users);
  res.render("users_login", templateVars);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : LOGIN : POST : Takes username from form input., Now email instead.
app.post("/login", (req, res) => {
  // users[getUserByEmail(req.body.email)]; // this was a bug. kept for reference.y
  
  // Check: login fields are empty
  if (!(req.body.email && req.body.password)) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : Empty email or password`);
    res.end("400 Bad request: Empty email or password");
  } else if (findEmail(req.body.email, users) !== true && VerifyPasswordOfEmail(req.body.email, req.body.password) !== true)  {
    // check: email & its password exist & match.
    res.statusCode = 403;
    console.log(`statusCode : ${res.statusCode} Bad request : email does not exist`);
    res.end("403 forbidden or invalid request : email does not exist or wrong password");
  } else {
    // app.post /login : actual logic
    console.log('---\nFROM INSIDE POST LOGIN : \nuser id is :' + getUserByEmail(req.body.email, users) + '\nbody password is : ' + req.body.password + '\n---\n');
    // res.cookie("user_id", getUserByEmail(req.body.email));
    req.session.user_id = getUserByEmail(req.body.email, users);

    console.log("FROM APP.POST LOGIN : getUserByEmail(req.body.email, users) = ", getUserByEmail(req.body.email, users));
    console.log("FROM APP.POST LOGIN : req.session.user_id = ", req.session.user_id);

    res.redirect("/urls");
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : LOGOUT : POST
app.post("/logout", (req, res) => {
  //delete the cookie (_)
  // res.clearCookie('username');
  req.session.user_id = null; // BUG?
  // res.clearCookie('user_id');
  res.redirect("/urls");
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : REGISTER : GET
app.get("/register", (req,res) => {
  let templateVars = {
    user : users[req.cookies["user_id"]]
  };
  res.render("users_register", templateVars);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : REGISTER : POST
// USER REGISTRATION //  QUESTION : status
app.post("/register", (req,res) => {
  if (!req.body.email) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : Empty email`);
    res.end("400 Bad request: Empty email");
  } else if (findEmail(req.body.email, users) === true) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : email already exists`);
    res.end("400 Bad request : email already exists");
  } else {
    // console.log(req.body)
    const user_ID = generateRandomString(8);
    // console.log("all good : random id gen");
    users[user_ID] = {};
    // console.log("all good : users")
    users[user_ID].id = user_ID;
    // console.log("all good : user ID")
    users[user_ID].email = req.body.email;
    // PASSWORD HASHING :
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log('hashed password from registration = ', hashedPassword);
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                       ROUTES FOR URLS                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// ROUTE : URLS : GET : List of URLs per user.
app.get("/urls", (req, res) => {
  // if (!req.cookies["user_id"]) {
  console.log('FROM app.get /urls .. req.session.user_id = ',req.session.user_id);
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// code to be inserted before the /:id (a.k.a. :shortURL) // order matters!
// reason: if placed after, Express will think /new is an :id ,
// but if this one has precedence (placed before), Express will know to treat it regularely (not ID).

// ROUTE : NEW URL : GET
app.get("/urls/new", (req, res) => {
  // console.log(req.cookies["user_id"]);
  // if (!req.cookies["user_id"]){
  if (!req.session.user_id) {
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// this following function is mentioned in the learning modules as :id instead of :shortURL -- I think.
// AKA: /urls/:id

// ROUTE : URL <URL ID> : GET
app.get("/urls/:shortURL", (req, res) => {
  // let userURLsObj = urlsForUser(req.cookies["user_id"]);
  let userURLsObj = urlsForUser(req.session.user_id);
  // if (!req.cookies["user_id"]) {
  if (!req.session.user_id) {
    // setTimeout(res.redirect("/login"), 3000);
    res.end("Please Login to view your URLs or register to create some new ones");
  } else if (!userURLsObj[req.params.shortURL]) {
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : URLS (LIST) : POST
// POSTs the form (in urls_new) to /URLs
app.post("/urls", (req, res) => {
  console.log('Console is now in app.post("/urls".. :\n',req.body);  // Log the POST request body to the console
  //call string random generation function for shortURL.
  let randomString = generateRandomString(6);

  // commit the changes in the urlDatabase object.
  console.log('randomString := ', randomString);       // TEST
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
  res.redirect("/urls/" + randomString);
  // res.location();
});
/* app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL:  urlDatabase[req.params.shortURL]  };
  res.render("urls_show", templateVars);
});  */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : SHORT URL LINK & REDIRECT : GET
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // const longURL = urlsForUser[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : DELETE URL <URL ID> : POST : (per user)
app.post("/urls/:shortURL/delete", (req, res) => {
  // let userURLsObj = urlsForUser(req.cookies["user_id"]);
  // let userURLsObj = urlsForUser(req.session.user_id);
  // if (!req.cookies["user_id"]) {
  if (!req.session.user_id) {
    // res.redirect("/login");
    res.end("Either you do not have the proper clearance to edit or Delete or you are not Logged in.\nPlease Login to view, edit or delete your URLs or register to create some new ones :)\n");
  // } else if ( !userURLsObj[req.params.shortURL] ) {
  //   // if the the URL with the matching :id does not belong to them.
  //   res.end("Sorry! You do not have the proper clearance to view this  URL");
  } else {
    console.log(urlDatabase);
    delete urlDatabase[req.params.shortURL];
    console.log(urlDatabase);
    res.redirect("/urls");
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// ROUTE : EDIT URL <URL ID> : POST (per user)
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
    res.redirect("/urls/" + shortURL);
  }
});
