# AirVuz2
AirVuz version 2

## How to start

1. Start webpack run `npm run build` or for production builds `npm run build:prod`. _You must run webpack to create the `public/manifest.json` file. This file is necessary to enable webpack's cache breaking features._
*Windows users use npm run build:win

2. Start node by running `sudo npm run`.

_**Note:** If you update a production client build you'll need to restart Express to pickup the new file names._

## Testing

- `npm test` — Runs Node.js and client tests, will end once completed.
- `npm run test:node` — Runs Node.js test, will end once completed. You can add aditional Jasmine command line options using the following syntax, `npm run test:node -- {options}`.
- `npm run test:karma` — Starts up a Karma server and beings testing client code. This will remain running until terminated and will execute tests after every change. You can add additional Karma command line options using the following syntax, `npm run test:karma -- {options}`. By default Karma only tests Chrome and Firefox, to test additional browsers use the following command, `npm run test:karma -- --browsers Safari,Chrome,Firefox`.

All test will create code coverage and place it in the `coverage/` folder.

## Nick's Notes

- I recommend against hard coding ports into the code. All ports should be able to be changed using an environmental variable or config file.
- Force HTTPS by redirecting all HTTP requests. Easy way is to make a second Express app that runs on HTTP and uses `res.redirect`.
- Disable SSL and force TSL on HTTPS. _98% of all browsers support some form of TSL._
- At some point make Express start up webpack. [Documentation can be found here.](http://webpack.github.io/docs/node.js-api.html)

