import Client from "@classes/Client";
import Event from ".";

export default class ProcessEvent extends Event {
    constructor(client: Client) {
        super(client);

        this.process = true;
    }
}
