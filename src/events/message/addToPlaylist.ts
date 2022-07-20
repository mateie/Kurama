import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { Guild, Message, GuildMember, TextChannel } from "discord.js";

export default class AddToPlaylistEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "messageCreate";
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

        if (playlist.tracks.includes(message.content.toLowerCase())) {
            const msg = await message.channel.send({
                content: `**${message.content}** is already in your playlist`,
            });
            setTimeout(() => {
                msg.delete();
                message.delete();
            }, 5000);

            return;
        }

        playlist.tracks.push(message.content.toLowerCase());

        await dbUser.save();

        const msg = await message.channel.send({
            content: `**${message.content}** was added to your playlist`,
        });

        setTimeout(() => msg.delete(), 5000);
    }
}
