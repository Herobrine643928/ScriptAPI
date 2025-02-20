import { world } from "@minecraft/server";
import { setVelocity } from "./index.js";

world.events.chatSend.subscribe(({sender}) => {
  setVelocity(sender.getViewDirection(), sender);
});