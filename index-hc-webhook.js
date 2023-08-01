"use strict";
import config from "./config/config.js";
import fetch from "node-fetch";
import { createServer } from "http";
import { ConsoleLogColors } from "js-console-log-colors";
const out = new ConsoleLogColors();

const server = createServer(async (req, res) => {
  out.info("##### Client Request: " + req.method + " " + req.url);

  const url = new URL(req.url, "http://example.test"); // leave this line as is
  if (req.method === "GET" || req.method === "POST") {
    const isHelpcrunch = req.headers["x-helpcrunch-signature"];
    if (!isHelpcrunch) {
      out.warn("HTTP 401: Not requested from HelpCrunch");
      res.write("Not requested from HelpCrunch");
      res.writeHead(401);
      res.end();
      return;
    }
    const arrPath = url.pathname.split("/");
    const paths = ["chat-new", "chat-assigned", "chat-rated"];
    if (paths.includes(arrPath[1])) {
      try {
        req.setEncoding("utf8");
        const rb = [];
        req.on("data", (chunks) => {
          rb.push(chunks);
        });
        req.on("end", () => {
          const data = JSON.parse(rb.join(""));
          let txt = "";
          switch (arrPath[1]) {
            case "chat-new":
              txt = `⭐ <i>A new chat has started!</i>`;
              if (data?.eventData?.customer?.name) {
                txt += `\n\nUser: <b>${data.eventData.customer.name}</b>`;
              }
              if (data?.eventData?.chat_id) {
                txt += `\n\n${config.HELPCRUNCH_CHATS_URL}${data.eventData.chat_id}`;
              }
              break;
            case "chat-assigned":
              txt = `✅ <i>Chat assigned</i>`;
              if (data?.eventData?.assignee?.name) {
                txt += ` to: <b>${data.eventData.assignee.name}</b>`;
              }
              break;
            case "chat-rated":
              txt = "<i>🏆 New rating received</i>";
              if (data?.eventData?.customer?.name) {
                txt += ` from: <b>${data.eventData.customer.name}</b>`;
              }
              if (data?.eventData?.rating) {
                switch (data.eventData.rating) {
                  case "poor":
                    txt += "\n\n<b>💩 POOr 💩</b>";
                    break;
                  case "average":
                    txt += "\n\n<b>👍😐 Average 😐👌</b>";
                    break;
                  case "great":
                    txt += "\n\n<b>🕺🤩 Great! 😇✨</b>";
                    break;
                  default:
                    break;
                }
              }

              if (data?.eventData?.assignee?.name) {
                txt += `\n\nCurrent admin: <b>${data.eventData.assignee.name}</b>`;
              }
          }
          // Telegram Notification
          doTelegramNotification(txt);

          // Discord Notification
          doDiscordNotification(txt);

          // Response
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
        });

        res.write(JSON.stringify({}));
        res.end();
        return;
      } catch (error) {
        out.error(`An error occurred: ${error.message}`);
      }
    }
  }

  res.writeHead(404);
  res.end();
});

server.listen(
  config.port,
  /*config.host,*/
  () => {
    out.success(`Server is running on http://${config.host}:${config.port}`);
  }
);

function doTelegramNotification(text = "", attempts = 1) {
  const json_body = {
    chat_id: config.TG_CHAT_ID,
    text: text,
  };

  fetch(
    `https://api.telegram.org/bot${config.TG_BOT_KEY}/sendMessage?parse_mode=html`,
    {
      method: "POST",
      body: JSON.stringify(json_body),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
    })
    .catch((e) => {
      console.log(">>>>> error calling telegram webhook");
      console.log(e);
      if (attempts <= 5) {
        console.log(`retrying attempt ${attempts} of 5 in 3 seconds...`);
        setTimeout(() => {
          doTelegramNotification(text, attempts + 1);
        }, 5000);
      } else {
        console.log(">>>>>>>>>> All attempts failed...");
      }
    });
}

function doDiscordNotification(text = "", attempts = 1) {
  const json_body = {
    content: text.replace(/<\/?i>/g, "*").replace(/<\/?b>/g, "**"),
  };
  fetch(
    `https://discord.com/api/webhooks/${config.DISCORD_WEBHOOK_ID}/${config.DISCORD_WEBHOOK_TOKEN}`,
    {
      method: "POST",
      body: JSON.stringify(json_body),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
    })
    .catch((e) => {
      if (e.type.includes("invalid-json")) {
        // Ignore the "invalid JSON" error, since a successful webhook might not return JSON response!
        return;
      }
      out.error(">>>>> error calling discord webhook:");
      out.error("Error type:");
      console.log(`>>> ${e.type}`);
      out.error("Error message:");
      console.log(`>>> ${e.message}`);
      if (attempts <= 5) {
        out.info(`retrying attempt ${attempts} of 5 in 3 seconds...`);
        setTimeout(() => {
          doDiscordNotification(text, attempts + 1);
        }, 5000);
      } else {
        out.error(">>>>>>>>>> All attempts failed...");
      }
    });
}
