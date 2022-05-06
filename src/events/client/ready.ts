import Event from '@classes/base/Event';
import Client from '@classes/Client';
import { IEvent } from '@types';

export default class ReadyEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = 'ready';
        this.once = true;
    }

    async run() {
        console.log(`Ready! Logged in as ${this.client.user?.tag}`);

        const mainGuild = await this.client.guilds.fetch('814017098409443339');
        this.client.mainGuild = mainGuild;

        this.client.database.guilds.verify();
        this.client.guilds.cache.forEach(async guild => this.client.database.members.verify(guild));

        this.client.deploy();
        
        this.client.setPresence();
    }
}