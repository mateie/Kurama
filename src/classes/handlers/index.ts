import Client from "@classes/Client";
import { HandlerOptions } from "@types";

export default class Handler {
  readonly client: Client;
  readonly directory: string;

  constructor(client: Client, { directory }: HandlerOptions) {
    this.client = client;

    this.directory = directory;
  }
}
