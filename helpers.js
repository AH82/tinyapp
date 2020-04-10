const { urlDatabase, users } = require("./helpers_databases");
const bcrypt = require('bcrypt');

/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *       HELPER FUNCTIONS / MIDDLEWARE FOR :       *
 *                express_server.js                *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */


// HELPER FUNCTION : generate [unique] random strings for user & url IDs
const generateRandomString = function(length) {
  // length: How long is required randomString (number)
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; 
   
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length)); // random # between 0-1, multiplied by the number of possible characters -> rounded then character at this position, then pushed into the string.
   
  return text;
};

// HELPER FUNCTION : returns true if user email exists.
const findEmail = function(email, userDatabseObj) {
  for (let user in userDatabseObj) {
    if (userDatabseObj[user].email === email) {
      return true;
    } else return false;
  }
};

// HELPER FUNCTION : takes user email and returns his ID
const getUserByEmail = function(email, userDatabseObj) {
  for (let user in userDatabseObj) {
    if (userDatabseObj[user].email === email) {
      return userDatabseObj[user].id;
    }
  }
};

// HELPER FUNCTION : returns true if password corresponding to an email is found.
const verifyPasswordOfEmail = function(email, password) {
  
  if (users[getUserByEmail(email, users)]) {

    const hashedPassword = users[getUserByEmail(email, users)].password;
    if (bcrypt.compareSync(password, hashedPassword)) {
      return true;
    }
  } else return false;
};

// HELPER FUNCTION : returns the URLs where the userID is equal to the id of the currently logged in user.
const urlsOfUser = function(id) {
  //presumeably this will take it from the cookie
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLs;
};


module.exports = {generateRandomString, findEmail, getUserByEmail, verifyPasswordOfEmail, urlsOfUser };