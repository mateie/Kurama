import Client from "@classes/Client";
import Event from "@classes/base/event";
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

        if (!member) return;

        if (member.user.bot) return;
        if (message.content.length < 1) return;

        const dbUser = await this.client.database.users.get(member.user);
        if (!dbUser) return;

        if (!dbUser.playlists || dbUser.playlists.length < 1) return;

        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        if (!playlist) return;

        if (message.channel.id !== playlist.channelId) return;

        const channel = guild.channels.cache.get(
            playlist.channelId
        ) as TextChannel;
        if (!channel) return;

        playlist.tracks = playlist.tracks.filter(
            (track) => track.toLowerCase() !== message.content.toLowerCase()
        );

        await dbUser.save();

        const msg = await message.channel.send({
            content: `**${message.content}** was removed from your playlist`,
        });
        setTimeout(() => msg.delete(), 5000);
    }
}
