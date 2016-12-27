# AirVuz2
AirVuz version 2

## How to start

1. Start webpack run `npm run build` or for production builds `npm run build:prod`. _You must run webpack to create the `public/manifest.json` file. This file is necessary to enable webpack's cache breaking features._

2. Start node by running `sudo npm run`.

_**Note:** If you update a production client build you'll need to restart Express to pickup the new file names._

## Testing

- `npm test` — Runs Node.js and client tests, will end once completed.
- `npm run test:node` — Runs Node.js test, will end once completed. You can add aditional Jasmine command line options using the following syntax, `npm run test:node -- {options}`.
- `npm run test:karma` — Starts up a Karma server and beings testing client code. This will remain running until terminated and will execute tests after every change. You can add additional Karma command line options using the following syntax, `npm run test:karma -- {options}`. By default Karma only tests Chrome and Firefox, to test additional browsers use the following command, `npm run test:karma -- --browsers Safari,Chrome,Firefox`.

All tests will create code coverage and place it in the `coverage/` folder.

## API Testing
1. Globally NPM install mocha "-g", or update package.json "test:api:local" and point to node_modules folder containing mocha exe
2. Create a new user for testing, or if you want to use an existing go to step 2 
3. Update package.json to include the email, username and password created in step one, assigning the value to 
 TEST_EMAIL, TEST_USER and TEST_PWD on the line beginning with test:api:local. For example;
- "test:api:local" : "NODE_TEST_ENV=localhost:3000 TEST_EMAIL=email@server.com TEST_USER=testingUser TEST_PWD=password mocha testV2/api/*.js --reporter spec",
- to execute the API tests on beta.airvuz.com update the line beginning with test:api:beta
4. Update the same line to include the hostname and port of your local environment (NODE_TEST_ENV=)
5. Enter "sudo npm run test:api:local" to execute all API tests in testV2/api folder from the cmd line
6. To debug any tests, create a new Mocha "Run/Debug configuration" within WebStorm
- include the same environment variables as in the package.json file along with their appropriate values
- point to the test file within the testV2/api folder
- when a new configuration has been saved, select it from the test list dropdown and click the debug icon

## Windows

If you receive an error trying to run a NPM script on Windows. Add a `:win` to the end of the command and that will use a special Windows version of the script. This is due to the differences between how *nix systems and Windows do environmental variables.

_**Note:** When setting an environmental variable for Windows make sure to not add whitespace after the variable value. This is right `set NODE_ENV=production&& node app.js`, this is wrong `set NODE_ENV=production && node app.js`._

## Nick's Notes

- I recommend against hard coding ports into the code. All ports should be able to be changed using an environmental variable or config file.
- Disable SSL and force TSL on HTTPS. _98% of all browsers support some form of TSL._
- At some point make Express start up webpack. [Documentation can be found here.](http://webpack.github.io/docs/node.js-api.html)
- For E2E testing I recommend Cucumber.js it has support for Karma and is framework agnostic.

##URL Parameters
For debugging purposes and live reload when making front end changes append this to the end of the URL
?viewPrettyPrint=true&reloadView=true
?reloadView=true

## Creating new views

- register accordingly in server.js
- create view model in views/model/ directory
- create exampleView.js in views/view directory
- create dust template in views/view/template directory

## Dependencies
- ffprobe
- imageMagick

## Deployment
install [awsebcli](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
Initialize EB CLI Project `eb init`
- default region: us-west-2 (Oregon)
- aws-accesss-id
- aws-secret-key
- select the airvuz application
- platform is Node.js
- set up the ssh with your keypair

Commands:
- `eb list` - use to list all available environments for the current eb application
- `eb use (beta | airvuz-prod)` - switch branch to use an environment
- `eb deploy` - user to deploy the HEAD of the current git branch
- `eb deploy` --staged - use to deploy the HEAD and stage file of the current git branch

Set master branch to use airvuz-prod - `eb use airvuz-prod`
Rebase with develop then use the command to deploy