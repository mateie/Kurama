import { Queue } from "discord-player";
import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";

export default class MusicErrorEvent extends Event implements IEvent {
  constructor(client: Client) {
    super(client);

    this.name = "error";
  }

  run(queue: Queue, error: string) {
    console.error(error);
  }
}
