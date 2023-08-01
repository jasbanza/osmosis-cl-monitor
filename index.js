"use strict";
import config from "./config/config.js";
import converter from "convert-bech32-address"; // convert-bech32-address by jasbanza
// import { ConsoleLogColors } from "js-console-log-colors";

import out from "js-console-log-colors"; // js-console-log-colors by jasbanza
// const out = new ConsoleLogColors();
import fetch from "node-fetch"; // node-fetch@2
import express from "express"; // Import the Express module
import swaggerUi from "swagger-ui-express"; // Import swagger module
import swaggerDocument from "./config/swagger.json" assert { type: "json" }; // previously built swagger config
import swaggerJSDoc from "swagger-jsdoc";
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hello World",
      version: "1.0.0",
    },
  },
  apis: ["./index.js"], // files containing annotations as above
});

// Add the main router to the application
const app = express();

// generic middleware function to log every request
app.use((req, res, next) => {
  out.info(`Requested URL: ${req.originalUrl}`);
  next();
});

init_app_root();
app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);
// app.use(
//   "/swagger",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, { explorer: true })
// );

init_app_positions();
init_app_endpoints();
// init_app_pos();
init_convertaddress();

// sets up test router
init_testRouter();

// listen
app.listen(config.port, () => {
  out.success(`Server is running on http://${config.host}:${config.port}`);
});

// ============ FUNCTIONS =================

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

function init_testRouter() {
  // Create a router to handle the prefix path
  const testRouter = express.Router();

  // Define the routes for the prefix router
  testRouter.get("*", (req, res, next) => {
    out.warn("routing through testRouter");
    //   req.params = config.testParams;
    // Forward the request to the main router
    next();
  });
  // Add the prefix router to the application
  app.use("/test", testRouter);
}

function init_app_root() {
  app.get("/", (req, res) => {
    console.log(req.params);
    res.json(req.params);
  });
}

function init_app_positions() {
  app.get("/positions/:wallet?", (req, res) => {
    // The wallet parameter is now 123

    const { wallet } = req.params;
    if (!wallet) {
      out.error("Please specify a wallet address: /positions/<address>");
      return res.status(400).json({
        error: "Please specify a wallet address: /positions/<address>",
      });
    }
    // Do something with the wallet

    let output = `Wallet: ${wallet}`;

    res.send(output);
    out.success(output);
  });
}

function init_convertaddress() {
  app.get("/convertaddress/:wallet?", (req, res) => {
    // The wallet parameter is now 123

    const { wallet } = req.params;
    if (!wallet) {
      out.error("Please specify a wallet address: /convertaddress/<address>");
      return res.status(400).json({
        error: "Please specify a wallet address: /convertaddress/<address>",
      });
    }
    // Do something with the wallet

    const output = {};
    const arrWallets = getWallets_cointype_118(wallet);

    res.send(arrWallets);
    out.success(JSON.stringify(arrWallets));
  });
}

function init_app_endpoints() {
  app.get("/endpoints", (req, res) => {
    const endpoints = showEndpoints();
    let html = "<ul>";
    for (const endpoint of endpoints) {
      html += `<li>${endpoint.path}</li>`;
    }
    html += "</ul>";
    console.log(endpoints);
    res.send(html);
  });
}

function init_app_pos() {
  app.get("/pos", (req, res) => {
    out.success("POS");
    res.send("POS");
  });
}

// other functions

async function getWallets_cointype_118(baseWalletAddress) {
  const outputData = { wallets: [] }; // return this
  try {
    const sourceListJSON = await fetchWithRetries({
      url: "https://raw.githubusercontent.com/osmosis-labs/assetlists/main/osmosis-1/osmosis-1.chainlist.json",
    })
      .then((res) => res.json())
      .then((json) => {
        return json;
      });

    for (const chain of sourceListJSON.chains) {
      if (chain?.status != "live") {
        continue; // skip if not live
      }

      if (chain?.slip44 != 118) {
        continue; // skip if not 118
      }

      const derivedWalletAddress = converter.lookup(
        baseWalletAddress,
        chain.bech32_prefix
      );

      outputData.wallets.push({
        chain_name: chain.chain_name,
        chain_id: chain.chain_id,
        wallet: derivedWalletAddress,
      });
    }
  } catch (err) {
    console.error(err);
  }
  return outputData;
  // const sourceListJSON = await fetchWithRetries({
  //     url: config.monitor.sourceListJSON,
  //   })
  //     .then((res) => res.json())
  //     .then((json) => {
  //       return json;
  //     });

  //   out.success(`>> found ${sourceListJSON.chains.length} chains`);
  //   for (const chain of sourceListJSON.chains) {
  //     if (chain?.status != "live") {
  //       continue; // skip if not live
  //     }
  //     const restBaseURL = chain?.apis?.rest[0]?.address;
  //     if (!restBaseURL) {
  //       // if no rest endpoint provided, alert immediately .
  //       out.failure(`🔴 ${chain.chain_id} endpoint unavailable`);
  //       continue;
  //     }

  //     if (restBaseURL.includes("keplr")) {
  //       out.warn(`🔵 ${chain.chain_id} keplr endpoint`);
  //       continue;
  //     }
  //     const urlRestLatestBlock = `${restBaseURL}/cosmos/base/tendermint/v1beta1/blocks/latest`;
  //     const test = await fetchWithRetries({
  //       url: urlRestLatestBlock,
  //     })
  //       .then((res) => res.json())
  //       .then((json) => {
  //         out.success(`🟢 ${chain.chain_id} endpoint available`);
  //       })
  //       .catch((e) => {
  //         out.failure(`🔴 ${chain.chain_id} endpoint unavailable`);
  //       });
  //   }
}

async function fetchWithRetries({
  url = null,
  attempts = 1,
  maxAttempts: maxRetries = config.retry.maxRetries,
  intervalSeconds = config.retry.intervalSeconds,
}) {
  if (!url) {
    return {};
  }

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })
    .then((res) => {
      return res;
    })
    .catch(async (e) => {
      if (error.code === "ENOTFOUND") {
        console.error("The requested URL was not found (DNS related).");
        // Handle the ENOTFOUND error here
      } else {
        out.warn(">>>>> error fetching url:");
        console.warn(error.message);
        // Handle other errors here
      }
      if (attempts <= maxRetries) {
        console.info(
          `retrying attempt ${attempts} of ${maxRetries} in ${intervalSeconds} seconds...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, intervalSeconds * 1000)
        );

        return await fetchWithRetries({
          url,
          attempts: attempts + 1,
          maxRetries: maxRetries,
          intervalSeconds,
        });
      } else {
        console.warn(">>>>>>>>>> All attempts failed...");
      }
    });
}
