# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot for URL page "](https://github.com/AH82/tinyapp/blob/master/docs/tinyApp_urls_creenshot.png?raw=true)
<!-- !["screenshot description"](#) -->

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
  http://localhost:8080/urls (you must be logged in)

- Follow your instinct!

## Notes & Tips : 
- when you enter a new URL or edit one, the domain address must start with "http://". (i.e "http://www.example.ca" , not just "www.example.ca".)