# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## DevDependencies
- mocha (testing)
- Chai (testing)

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command, or `npm start` command.
- On your web browser, go to :
  - To register a new user :
  http://localhost:8080/register
  - To Login : 
  http://localhost:8080/login
  -  for a list of user URLs
  http://localhost:8080/urls (buggy if not logged in)

- Follow your instinct!

## Known Issues
- 2020-02-23 : a major bug is introduced when it comes to users tring to edit their links or create a new ones. Investigation and debugging is undergoing. 
- 2020-02-23 : Logging out works but may be faulty (minor bug), it does not seem to delete the cookie. more investigation is undergoing.
