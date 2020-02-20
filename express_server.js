const express = require("express");
const app = express();
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

// database of tinyApp URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// code to be inserted before the /:id (a.k.a. :shortURL) // order matters!
// reason: if placed after, Express will think /new is an :id , 
//          but if this one has precedence (placed before), Express will know to treat it regularely (not ID).
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// this following function is mentioned in the learning modules as :id instead of :shortURL -- I think.
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL:  urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
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
  const longURL = urlDatabase[req.params.shortURL] 
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase)
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase)
  res.redirect("/urls");
});