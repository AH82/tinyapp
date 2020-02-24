const bcrypt = require('bcrypt');

/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *       HELPER DATABASES / MIDDLEWARE FOR :       *
 *                express_server.js                *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */

// DATABASE : URLs (OBJECT, incl. OBJECTS)
// key: value => shortURL: longURL
// UPDATE : W3D3 : database now have property's values as (sub) URL-objects with longURL and userID as keys
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

// DATABASE : USERS (OBJECT)
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

module.exports = { urlDatabase, users };