# fragments

**Extensions:**
- ESLint - Linting tool for JS 
- Prettier Code Formatter - Code formatting tool 
- Code Spell Checker - Checks for spelling errors in our code 
- GitHub Workflow - Automation scripts that can be set up in a repo to run CI tasks such as testing, building, and deplyoing. Defined in YAML files.
<br /><br />
**curl vs curl.exe:**
- curl: Command line tool used for making HTTP requests, typically on Unix systems. 
- curl.exe: Same as curl but specifically for windows. Better to use to avoid any conflicts with powershell and built in cmds. 
<br /><br />
**npm commands:**
- npm init -y: Initializes project and creates a package.json file with default settings. the "y" is used to accept all conditions. 
- npm: Command for calling Node Package Manager program. 
- npm start: Runs the application in production mode. Doesn't watch for changes or enabling debug mode when the server starts up. 
- npm run dev: Runs the application in development mode. Watches for changes in src/. Will automatically restart the server when changes are made. 
- npm run debug: Runs the application and enables Node.js debugging. 
- npm test: Runs Jest test suite.
- npm run coverage: Runs Jest test suite with coverage reporting enabled. Shows which parts of the code are tested and which aren't.
- npm run test:watch: Runs Jest in watch mode where tests auto-rerun when changes are detected in the code.

<br /><br />
**Packages:**
- Stoppable: Allows the server to exit gracefully; waits until current connections are finished before shutting down
- Prettier: Code formatting tool that automatically formats code to ensure it follows consistent style rules; clean, readable, and standardized code across a project. 
- Pino: low-overhead logging package for Node.js apps. Designed for performance and minimal impact on the application while providing powerful logging capabilities. 
- Express: framework for Node.js used for web building applications nad APIs. Provides a robust set of features for handling HTTP requests, routes, and middleware. 
- CORS: Allows a server to handle requests from different origins (Domains, Ports, Protocols), enabling an API to be accessible from web apps running on other domains. 
- Helmet: Security package that helps secure Express apps by setting various HTTP headers. It protects against several common web vulnerabilities by hardening HTTP responses. 
- Compression: Middleware package which compresses HTTP responses, reducing the size of responses and improving performance for users. 
- Nodemon: Restarts Node.js app whenever it detects changes in the source files.
- Jest: Testing framework that allows developers to write unit and integration tests for JS apps. It provides functionalities like test suites, test coverage, and test reporting.
- Supertest: HTTP assertions library used for testing Express and Node.js APIs. Allows us to send requests to an API and check responses.

