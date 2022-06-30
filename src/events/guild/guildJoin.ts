import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { Guild } from "discord.js";

export default class GuildJoinEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "guildCreate";
    }

    async run(guild: Guild) {
        this.client.database.guilds.verify(guild);
    }
}
