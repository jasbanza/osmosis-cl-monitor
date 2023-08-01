// import fetch from "node-fetch";
import { exec } from "child_process";
import { ConsoleLogColors } from "js-console-log-colors";
const out = new ConsoleLogColors();

function getUserPositions(walletAddress) {
    console.log("here2");
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

let methods = {};

methods.positions = function (req, res) {
  // Do something with the wallet parameter
  out.info("/positions");
  const { wallet } = req.params; // || req.defaultParams.wallet;
  console.log(wallet);
  // Check if the "wallet" parameter is provided
  if (!wallet) {
    return res.status(400).json({
      error: "Please specify a wallet address. (/positions/<address>",
    });
  }

  console.log("here1");
  const positions = getUserPositions(wallet);
  console.log(positions);
  // Sending the JSON response
  res.json(positions);
};

export default methods;
