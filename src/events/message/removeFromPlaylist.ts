import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";
import { Message, GuildMember, Guild, TextChannel } from "discord.js";

export default class RemoveFromPlaylistEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "messageDelete";
    }

    async run(message: Message) {
        const guild = message.guild as Guild;
        const member = message.member as GuildMember;

        if (member.user.bot) return;
        if (message.content.length < 1) return;

        const user = await this.client.database.users.get(member.user);
        if (!user) return;

        if (!user.playlist.channelId) return;

        if (message.channel.id !== user.playlist.channelId) return;

        const channel = guild.channels.cache.get(
            user.playlist.channelId
        ) as TextChannel;
        if (!channel) return;

        user.playlist.tracks = user.playlist.tracks.filter(
            (track) => track.toLowerCase() !== message.content.toLowerCase()
        );

        await user.save();

        const msg = await message.channel.send({
            content: `**${message.content}** was removed from your playlist`,
        });
        setTimeout(() => msg.delete(), 5000);
    }
}
