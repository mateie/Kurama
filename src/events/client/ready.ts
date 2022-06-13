import Event from "@classes/base/Event";
import Client from "@classes/Client";
import { IEvent } from "@types";
import { TextChannel } from "discord.js";

export default class ReadyEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "ready";
        this.once = true;
    }

    async run() {
        console.log(`Ready! Logged in as ${this.client.user?.tag}`);

        this.client.mainGuild = await this.client.guilds.fetch(
            "814017098409443339"
        );
        this.client.botLogs = (await this.client.mainGuild.channels.fetch(
            "974256729661509632"
        )) as TextChannel;

        this.client.database.guilds.verify();
        this.client.database.users.verify();

        this.client.deploy();

        setInterval(() => {
            this.client.setPresence();
        }, 5000);

        this.client.dashboard.init();
    }
}
