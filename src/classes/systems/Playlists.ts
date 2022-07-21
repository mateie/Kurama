import Client from "@classes/Client";
import { userMention } from "@discordjs/builders";
import {
    ContextMenuInteraction,
    TextChannel,
    Message,
    VoiceChannel,
    CategoryChannel,
    CommandInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
    Guild,
    GuildMember
} from "discord.js";
export default class Playlists {
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction:
            | CommandInteraction
            | ButtonInteraction
            | ModalSubmitInteraction
    ) {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;

        const dbUser = await this.client.database.users.get(member.user);
        const dbGuild = await this.client.database.guilds.get(guild);

        const everyone = guild.roles.everyone;
        const memberRole = guild.roles.cache.get(dbGuild.roles.member);

        const category = guild.channels.cache.get(
            dbGuild.categories.playlists
        ) as CategoryChannel;

        const playlist = dbUser.playlists.find((pl) => pl.guildId === guild.id);

        if (playlist) {
            const channel = guild.channels.cache.get(playlist.channelId);

            return interaction.reply({
                content: `You already have a playlist created: ${channel}`,
                ephemeral: true
            });
        }

        const newChannel = await guild.channels.create(
            `${member.user.username}-${member.user.discriminator}-playlist`,
            {
                type: "GUILD_TEXT",
                parent: category,
                permissionOverwrites: [
                    {
                        id: everyone.id,
                        deny: ["SEND_MESSAGES"]
                    },
                    {
                        id: member.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                    }
                ]
            }
        );

        if (memberRole)
            newChannel.permissionOverwrites.edit(memberRole.id, {
                SEND_MESSAGES: false
            });

        dbUser.playlists.push({
            guildId: guild.id,
            channelId: newChannel.id,
            tracks: [],
            sharedWith: []
        });

        await dbUser.save();

        return interaction.reply({
            content: `Created a playlist for you ${newChannel}`,
            ephemeral: true
        });
    }

    async view(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;

        const playlist = await this.client.playlists.get(member);
        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true
            });
        const embed = this.client.util.embed().setTitle("Your Playlist");

        if (playlist.sharedWith.length < 1)
            embed.addField("Shared With", "No one");
        else {
            const sharedWith = playlist.sharedWith
                .map((id) => userMention(id))
                .join(", ");
            embed.addField("Shared With", sharedWith);
        }

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    async delete(interaction: CommandInteraction) {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;

        const dbUser = await this.client.database.users.get(member.user);

        const playlist = dbUser.playlists.find((pl) => pl.guildId == guild.id);

        if (!playlist)
            return interaction.reply({
                content: "No playlist found on this server",
                ephemeral: true
            });

        const channel = guild.channels.cache.get(playlist.channelId);
        if (channel) await channel.delete();

        dbUser.playlists = dbUser.playlists.filter(
            (pl) => pl.guildId !== guild.id
        );

        await dbUser.save();

        return interaction.reply({
            content: "Deleted your playlist",
            ephemeral: true
        });
    }

    async queue(interaction: CommandInteraction) {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;

        const dbUser = await this.client.database.users.get(member.user);

        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const channel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true
            });

        if (!voiceChannel)
            return interaction.reply({
                content:
                    "You must be in a voice channel to be able to queue your playlist",
                ephemeral: true
            });

        if (
            guild.me?.voice.channelId &&
            voiceChannel.id !== guild.me?.voice.channelId
        )
            return interaction.reply({
                content: `I'm already playing music in ${guild.me.voice.channel}`,
                ephemeral: true
            });

        if (member.voice.deaf)
            return interaction.reply({
                content: "You cannot play music when deafened",
                ephemeral: true
            });

        let queue = this.client.music.getQueue(guild);

        if (!queue) {
            queue = this.client.music.createQueue(guild, {
                metadata: channel
            });

            try {
                if (!queue.connection) await queue.connect(voiceChannel);
            } catch {
                queue.destroy();
                return await interaction.reply({
                    content: "Could not join your voice channel",
                    ephemeral: true
                });
            }
        }

        await interaction.deferReply({
            ephemeral: true
        });

        const tracks = await Promise.all(
            playlist.tracks.map(async (query) => {
                const track = (
                    await this.client.music.search(query, {
                        requestedBy: member.user
                    })
                ).tracks[0];
                return track;
            })
        );

        queue.addTracks(tracks);
        if (!queue.playing) queue.play();

        await interaction.followUp({
            content: "Your playlist has been queued",
            ephemeral: true
        });
        return;
    }

    async add(
        interaction: CommandInteraction | ContextMenuInteraction,
        message: Message
    ) {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;

        const dbUser = await this.client.database.users.get(member.user);

        if (!dbUser.playlists || dbUser.playlists.length < 1)
            return interaction.reply({
                content: "You do not own any playlists",
                ephemeral: true
            });
        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true
            });

        playlist.tracks.push(message.content.toLowerCase());

        await dbUser.save();

        return interaction.reply({
            content: `**${message.content}** was added to your playlist`,
            ephemeral: true
        });
    }

    async share(interaction: CommandInteraction) {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;

        const dbUser = await this.client.database.users.get(member.user);
        if (!dbUser.playlist.channelId || dbUser.playlist.channelId.length < 1)
            return interaction.reply({
                content: "You do not own a playlist channel",
                ephemeral: true
            });
        const shareWith = interaction.options.getMember("with") as GuildMember;

        if (dbUser.playlist.sharedWith.includes(shareWith.id))
            return this.unshare(interaction);

        const channel = guild.channels.cache.get(
            dbUser.playlist.channelId
        ) as TextChannel;

        dbUser.playlist.sharedWith.push(shareWith.id);

        await channel.permissionOverwrites.edit(shareWith.id, {
            VIEW_CHANNEL: true
        });

        await dbUser.save();

        return interaction.reply({
            content: `Shared your playlist with ${shareWith}`,
            ephemeral: true
        });
    }

    async shareContext(interaction: ContextMenuInteraction) {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;

        const dbUser = await this.client.database.users.get(member.user);

        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const shareWith = await guild.members.fetch(interaction.targetId);

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true
            });

        if (playlist.sharedWith.includes(shareWith.id))
            return this.unshareContext(interaction);

        const channel = guild.channels.cache.get(
            playlist.channelId
        ) as TextChannel;

        playlist.sharedWith.push(shareWith.id);

        await channel.permissionOverwrites.edit(shareWith.id, {
            VIEW_CHANNEL: true
        });

        await dbUser.save();

        return interaction.reply({
            content: `Shared your playlist with ${shareWith}`,
            ephemeral: true
        });
    }

    async unshare(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        const guild = interaction.guild as Guild;

        const dbUser = await this.client.database.users.get(member.user);

        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const shareWith = interaction.options.getMember("with") as GuildMember;

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true
            });

        const channel = guild.channels.cache.get(
            playlist.channelId
        ) as TextChannel;

        playlist.sharedWith = playlist.sharedWith.filter(
            (id) => id !== shareWith.id
        );

        await channel.permissionOverwrites.delete(shareWith.id);

        await dbUser.save();

        return interaction.reply({
            content: `Stopped sharing your playlist with ${shareWith}`,
            ephemeral: true
        });
    }

    async unshareContext(interaction: ContextMenuInteraction) {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;

        const dbUser = await this.client.database.users.get(member.user);

        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const shareWith = await guild.members.fetch(interaction.targetId);

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true
            });

        const channel = guild.channels.cache.get(
            playlist.channelId
        ) as TextChannel;

        playlist.sharedWith = playlist.sharedWith.filter(
            (id) => id !== shareWith.id
        );

        await channel.permissionOverwrites.delete(shareWith.id);

        await dbUser.save();

        return interaction.reply({
            content: `Stopped sharing your playlist with ${shareWith}`,
            ephemeral: true
        });
    }

    get = async (member: GuildMember) =>
        (await this.client.database.users.get(member.user)).playlists.find(
            (playlist) => playlist.guildId === member.guild.id
        );
}
