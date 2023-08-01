"use strict";
import config from "./config/config.js";
// import { OsmosisPosition } from "./classes/OsmosisPosition";

// console log colors by jasbanza
import { ConsoleLogColors } from "js-console-log-colors";
const out = new ConsoleLogColors();

// express web server
import express from "express";
const app = express();
// import router from "./routes.js";
// app.use("/", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/endpoints", (req, res) => {
  const endpoints = showEndpoints();
  console.log(endpoints);
  res.json(endpoints);
});


app.listen(config.port, () => {
  out.success(`Server is running on http://${config.host}:${config.port}`);
});

/*

// TODO: check environment windows or linux. if windows, use wsl command first...

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/endpoints", (req, res) => {
  const endpoints = showEndpoints();
  console.log(endpoints);
  res.json(endpoints);
});

// use the "/test" path prefix to use test parameters
app.get("/test", (req, res, next) => {
  out.info("test");
  //   req.defaultParams = config.testParams;
  req.params = {
    wallet: "default_wallet_address",
    // Add other default parameters here if needed
  };
  next();
});

app.get("/positions/:wallet?", (req, res, next) => {
  out.info("/positions");
  const { wallet } = req.params;// || req.defaultParams.wallet;
  console.log(wallet);
  // Check if the "wallet" parameter is provided
  if (!wallet) {
    return res.status(400).json({
      error: "Please specify a wallet address. (/positions/<address>",
    });
  }

  const positions = getUserPositions(wallet);

  // Sending the JSON response
  res.json(positions);
});


app.use('/', router);

app.listen(config.port, () => {
  out.success(`Server is running on http://${config.host}:${config.port}`);
});

function getUserPositions(walletAddress) {
  // run command
  let command = `osmosisd q concentratedliquidity user-positions ${walletAddress} --output json`;
  // let command = `ls -a`;

  if (process.platform == "win32") {
    command = `wsl ${command}`;
  }
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    return stdout;
  });
}

*/
// Function to show all endpoints
function showEndpoints() {
  const routes = [];

  // Iterate through all registered routes
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // route middleware
      const path = middleware.route.path;
      const methods = middleware.route.methods;
      routes.push({ path, methods });
    } else if (middleware.name === "router") {
      // router middleware (for sub-apps)
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp
            ? middleware.regexp.toString()
            : "UNKNOWN PATH";
          const methods = handler.route.methods;
          routes.push({ path, methods });
        }
      });
    }
  });

  return routes;
}
