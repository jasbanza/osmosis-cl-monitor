import methods from "./methods.js";
import config from "./config/config.js";
import express from "express";
const router = express.Router();

// Route for /positions/:wallet
router.get("/positions/:wallet", methods.positions);


// Route for /test/positions
router.get("/test/positions", (req, res) => {

  // Invoke the /positions/:wallet call with the test parameters
  router.get("/positions/" + config.testParams.wallet, methods.positions);
});

export default router;
