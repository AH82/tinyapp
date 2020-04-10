const { urlDatabase, users } = require("./helpers_databases");
const bcrypt = require('bcrypt');

/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *       HELPER FUNCTIONS / MIDDLEWARE FOR :       *
 *                express_server.js                *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */


// generates [unique] random strings for user & url IDs
const generateRandomString = function(length) {
  // length: How long is required randomString (number)
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; 
   
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length)); // random # between 0-1, multiplied by the number of possible characters -> rounded then character at this position, then pushed into the string.
   
  return text;
};

const findEmail = function(email, userDatabseObj) {
  for (let user in userDatabseObj) {
    if (userDatabseObj[user].email === email) {
      return true;
    } else return false;
  }
};

const getUserByEmail = function(email, userDatabseObj) {
  for (let user in userDatabseObj) {
    if (userDatabseObj[user].email === email) {
      return userDatabseObj[user].id;
    }
  }
};

const verifyPasswordOfEmail = function(email, password) {
    if (users[getUserByEmail(email, users)]) {
    const hashedPassword = users[getUserByEmail(email, users)].password;
    if (bcrypt.compareSync(password, hashedPassword)) {
      return true;
    }
  } else return false;
};

// gets user's URLs
const urlsOfUser = function(id) {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLs;
};


module.exports = {generateRandomString, findEmail, getUserByEmail, verifyPasswordOfEmail, urlsOfUser };