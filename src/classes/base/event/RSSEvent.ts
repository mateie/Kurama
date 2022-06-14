import Client from "@classes/Client";
import Event from ".";

export default class RSSEvent extends Event {
    constructor(client: Client) {
        super(client);

        this.rss = true;
    }
}
