import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { GuildMember } from "discord.js";

export default class DestroyQueueEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "voiceChannelLeave";
    }

    async run(member: GuildMember) {
        if (member.id !== this.client.user?.id) return;

        const queue = this.client.music.getQueue(member.guild);

        if (queue) queue.destroy();
    }
}
