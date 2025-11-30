import amqp from "amqplib"
import { clientWelcome, commandStatus, getInput, printClientHelp, printQuit } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind } from "../internal/pubsub/declareAndBind.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { commandMove } from "../internal/gamelogic/move.js";

async function main() {
  console.log("Starting Peril client...");
  const connString = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(connString);
  console.log("Client Connection to RabbitMQ was successfull.");
  let isRunning = true;

  const userName = await clientWelcome()

  await declareAndBind(conn, ExchangePerilDirect, PauseKey + "." + userName, PauseKey, "transient")

  const gameState = new GameState(userName);

  while (isRunning) {
    const input = await getInput();
    switch (input[0]) {
      case "move":
        const moved = commandMove(gameState, input);
        if (moved)
          console.log("Move worked")
        break;
      case "spawn":
        commandSpawn(gameState, input);
        break;
      case "status":
        commandStatus(gameState);
        break;
      case "spam":
        console.log("Spamming not allowed yet!")
        break;
      case "help":
        printClientHelp();
        break;
      case "quit":
        printQuit();
        isRunning = false;
        break;
      default:
        console.log("Command is unknown, try again")
        break;
    }
  }


}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
