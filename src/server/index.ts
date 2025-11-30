import amqp from "amqplib"
import publishJSON from "../internal/pubsub/publishJSON.js";
import { ExchangePerilDirect, ExchangePerilTopic, GameLogSlug, PauseKey } from "../internal/routing/routing.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind } from "../internal/pubsub/declareAndBind.js";

async function main() {
  console.log("Starting Peril server...");
  const connString = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(connString);
  let isRunning = true;
  console.log("Server Connection to RabbitMQ was successfull.");

  const channel = await conn.createConfirmChannel();
  await declareAndBind(conn, ExchangePerilTopic, GameLogSlug, `${GameLogSlug}.*`, "durable");

  ["SIGTERM", "SIGINT"].forEach(signal => {
    process.on(signal, () => {
      console.log("\nProgram is shutting down...");
      conn.close();
      process.exit(0);
    })
  });

  printServerHelp();

  while (isRunning) {
    const input = await getInput();
    switch (input[0]) {
      case "pause":
        console.log("Sending pause message.");
        publishJSON(channel, ExchangePerilDirect, PauseKey, { isPaused: true });
        break;
      case "resume":
        console.log("Sending resume message.");
        publishJSON(channel, ExchangePerilDirect, PauseKey, { isPaused: false });
        break;
      case "quit":
        isRunning = false;
        break;
      default:
        console.log("I don't understand the command.")
        break;
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
