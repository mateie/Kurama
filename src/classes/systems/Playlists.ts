import Client from "@classes/Client";
import { CommandInteraction, ButtonInteraction, ModalSubmitInteraction, Guild, GuildMember, CategoryChannelResolvable } from "discord.js";

export default class Playlists {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
        member: GuildMember,
    ) {
        const guild = interaction.guild as Guild;
        const dbUser = await this.client.database.users.get(member.user);
        const dbGuild = await this.client.database.guilds.get(guild);

        const everyone = guild.roles.everyone;
        const memberRole = guild.roles.cache.get(dbGuild.roles.member);
        if(!memberRole) return interaction.reply({ content: "Member role not setup, let server owner know please", ephemeral: true });

        const category = guild.channels.cache.get(dbGuild.channels.playlists) as CategoryChannelResolvable;

        if (guild.channels.cache.find(ch => ch.name.includes(`${member.user.username}-${member.user.discriminator}-playlist`)) || (dbUser.playlist.channelId && dbUser.playlist.channelId.length > 0))
            return interaction.reply({ content: "You already have a playlist created, delete it or use it", ephemeral: true });

        const newChannel = await guild.channels.create(`${member.user.username}-${member.user.discriminator}-playlist`, {
            type: "GUILD_TEXT",
            parent: category,
            permissionOverwrites: [
                {
                    id: everyone.id,
                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                    id: memberRole.id,
                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                },
                {
                    id: member.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                }
            ]
        });

        dbUser.playlist.channelId = newChannel.id;

        await dbUser.save();

        return interaction.reply({ content: `Created a playlist for you ${newChannel}`, ephemeral: true });
    }
}