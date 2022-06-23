import Client from "@classes/Client";
import Warframe from "./Warframe";

export default class Games {
    client: Client;

    warframe: Warframe;

    constructor(client: Client) {
        this.client = client;

        this.warframe = new Warframe(this.client);
    }
}
