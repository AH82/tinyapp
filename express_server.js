/* * * * * * * * * * * * *  * * * * * * ** * * * * * * * * * * * *
 *                                                               *
 *                    SERVER & MAIN APP FILE :                   *
 *                       express_server.js                       *
 *                                                               *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* * * * * * * * * * * FILE REQUIREMENTS * * * * * * * * * * * * */

// REQUIRE : Helper files
const {generateRandomString, findEmail, getUserByEmail, verifyPasswordOfEmail } = require("./helpers.js");
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

  console.log("[Get][/login] : req.session = ", req.session);
  let templateVars = {
    user : users[req.session.user_id]
  };
  console.log("[Get][/login] templateVars =", templateVars)
  res.render("users_login", templateVars);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.post("/login", (req, res) => {
  
  if (!(req.body.email && req.body.password)) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : Empty email or password`);
    res.end("400 Bad request: Empty email or password");
  
  } else if (findEmail(req.body.email, users) !== true && verifyPasswordOfEmail(req.body.email, req.body.password) !== true)  {
    res.statusCode = 403;
    console.log(`statusCode : ${res.statusCode} Bad request : email does not exist`);
    res.end("403 forbidden or invalid request : email does not exist or wrong password");
  
  } else {

    req.session.user_id = getUserByEmail(req.body.email, users);
    console.log('[post][/login] req.session = ', req.session);
    console.log("...redirecting to [/urls]\n")
    res.redirect("/urls");
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.get("/register", (req,res) => {
  let templateVars = {
    user : users[req.cookies["user_id"]]
  };
  res.render("users_register", templateVars);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.post("/register", (req,res) => {

  // -- Validations -- 
  if (!req.body.email) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : Empty email`);
    res.end("400 Bad request: Empty email");

  } else if (!req.body.password) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : Empty password`);
    res.end("400 Bad request: Empty password");

  } else if (findEmail(req.body.email, users) === true) {
    res.statusCode = 400;
    console.log(`statusCode : ${res.statusCode} Bad request : email already exists`);
    res.end("400 Bad request : email already exists");

    // -- Logic -- 
  } else {
    const user_ID = generateRandomString(8);
    users[user_ID] = {};
    users[user_ID].id = user_ID;
    users[user_ID].email = req.body.email;
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log('hashed password from registration = ', hashedPassword);
    users[user_ID].password = hashedPassword;
    req.session.user_id = user_ID;
    res.redirect("/urls");
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                       ROUTES FOR URLS                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// ROUTE : URLS : GET : List of URLs per user.
app.get("/urls", (req, res) => {

  console.log('[get][/urls] : req.session =', req.session);

  if (!req.session.user_id) {
    res.end("Please Login to view your URLs or register to create some new ones - from just URLs");
  } else {
    let templateVars = {
      user : users[req.session.user_id],
      urls: urlsForUser(req.session.user_id)
    };
    res.render("urls_index", templateVars);
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* code to be inserted before the /:id (a.k.a. :shortURL) // order matters!
reason: if placed after, Express will think /new is an :id ,
but if this one has precedence (placed before), Express will know to treat it regularely (not ID).
 */

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user : users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// this following function is mentioned in the learning modules as :id instead of :shortURL -- I think.
// AKA: /urls/:id

app.get("/urls/:shortURL", (req, res) => {

  console.log("[get][/urls/:shortURL] : req.session = ", req.session);

    if (!req.session.user_id) {
      res.end("Please Login to view your URLs or register to create some new ones (from URLsShort");
    } 
    let userURLsObj = urlsForUser(req.session.user_id);
    if (!userURLsObj[req.params.shortURL]) {
      res.end("Sorry! You do not have the proper clearance to view this  URL");
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL:  userURLsObj[req.params.shortURL] ,
      user : users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.post("/urls", (req, res) => {
  console.log('[post][/urls] : req.body = ', req.body);
  let randomString = generateRandomString(6);

  // commit the changes in the urlDatabase object.
  console.log('[post][/urls] : randomString := ', randomString);       // TEST
  console.log('[post][/urls] : urlDatabase BEFORE :', urlDatabase);   // TEST
  urlDatabase[randomString] = {};
  urlDatabase[randomString]["longURL"] = req.body.longURL;
  urlDatabase[randomString]["userID"] = req.session.user_id;
  console.log('[post][/urls] : urlDatabase AFTER', urlDatabase);      // TEST


  res.redirect("/urls/" + randomString);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.end("Either you do not have the proper clearance to edit or Delete or you are not Logged in.\nPlease Login to view, edit or delete your URLs or register to create some new ones :)\n");
    // res.redirect("/login");
  } else {
    console.log("[post][/urls/:shortURL/delete] : urlDatabase (Before deletion)", urlDatabase);
    delete urlDatabase[req.params.shortURL];
    console.log("[post][/urls/:shortURL/delete] : urlDatabase (After deletion)", urlDatabase);
    res.redirect("/urls");
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.post("/urls/:shortURL/edit", (req, res) => {

  console.log("[post][/urls/:shortURL/edit] req.session = ", req.session)
  let userURLsObj = urlsForUser(req.session.user_id);
  console.log(`
  Route: Edit : 
  req.session.user_id : ${req.session.user_id} 
  userURLsObj : ${userURLsObj}
  `);
  if (!req.session.user_id) {
    res.end("Either you do not have the proper clearance to edit or Delete or you are not Logged in.\nPlease Login to view, edit or delete your URLs or register to create some new ones :)\n");
    // res.redirect("/login");
  } else {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id}; 
    res.redirect("/urls/" + shortURL);
  }
});
