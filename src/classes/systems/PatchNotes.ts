import Client from "@classes/Client";

import RSSFeedEmitter from "rss-feed-emitter";

export default class RSS {
    readonly client: Client;
    readonly emitter: RSSFeedEmitter;

    constructor(client: Client) {
        this.client = client;

        this.emitter = new RSSFeedEmitter();
    }
}
