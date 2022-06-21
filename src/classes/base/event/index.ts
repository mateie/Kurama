import Client from "@classes/Client";
import Util from "@classes/util";
import { Events } from "@types";

export default class Event {
    readonly client: Client;
    readonly util: Util;

    name!: Events;
    description: string | "No Description";
    category: string | undefined;
    once: boolean;
    process: boolean;
    rss: boolean;

    constructor(client: Client) {
        this.client = client;
        this.util = client.util;

        this.description = "No Description";

        this.once = false;
        this.process = false;
        this.rss = false;
    }

    toString = () => this.name;
}
