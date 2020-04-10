const { assert } = require('chai');

const { getUserByEmail, findEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});

describe('findEmail', function() {
  it('should return true if email matches in the user Database', function() {
    
    assert.isTrue(findEmail("user@example.com", testUsers));
  });
});

describe('findEmail', function() {
  it('should return False if email not found in the user Database', function() {
    
    assert.isNotTrue(findEmail("user3@example.com", testUsers));
  });
});