import { Queue } from "discord-player";
import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";

export default class ConnectionErrorEvent extends Event implements IEvent {
  constructor(client: Client) {
    super(client);

    this.name = "connectionError";
  }

  run(queue: Queue, error: string) {
    console.error(error);
  }
}
