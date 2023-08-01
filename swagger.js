import swaggerAutogen from "swagger-autogen";
import config from "./config/config.js";

const doc = {
  info: {
    title: "Osmosis CL Monitor",
    description: "API for Concentrated Liquidity Positions",
  },
  host: `${config.host}:${config.port}`,
  schemes: ["http"],
};

const outputFile = "./config/swagger.json";
const endpointsFiles = ["./index.js"];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc);
