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

        if (user.playlist.tracks.includes(message.content.toLowerCase())) {
            const msg = await message.channel.send({
                content: `**${message.content}** is already in your playlist`,
            });
            setTimeout(() => {
                msg.delete();
                message.delete();
            }, 5000);

            return;
        }

        user.playlist.tracks.push(message.content.toLowerCase());

        await user.save();

        const msg = await message.channel.send({
            content: `**${message.content}** was added to your playlist`,
        });
        setTimeout(() => msg.delete(), 5000);
    }
}
