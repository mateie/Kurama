import Client from '@classes/Client';
import { Events } from '@types';

export default class Event {
    readonly client: Client;
    name!: Events;
    description: string | 'No Description';
    category: string | undefined;
    once: boolean | null;

    constructor(client: Client) {
        this.client = client;

        this.description = 'No Description';

        this.once = null;
    }
}