import Client from '@classes/Client';
import Whitelist from './Whitelist';

export default class Moderation {
    client: Client;

    whitelist: Whitelist;

    constructor(client: Client) {
        this.client = client;

        this.whitelist = new Whitelist(this.client);
    }
}