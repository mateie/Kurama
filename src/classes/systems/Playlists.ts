import Client from "@classes/Client";
import {
    ContextMenuInteraction,
    TextChannel,
    Message,
    VoiceChannel,
} from "discord.js";
import {
    CommandInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
    Guild,
    GuildMember,
    CategoryChannelResolvable,
} from "discord.js";

export default class Playlists {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction:
            | CommandInteraction
            | ButtonInteraction
            | ModalSubmitInteraction,
        member: GuildMember
    ) {
        const guild = interaction.guild as Guild;
        const dbUser = await this.client.database.users.get(member.user);
        const dbGuild = await this.client.database.guilds.get(guild);

        const everyone = guild.roles.everyone;
        const memberRole = guild.roles.cache.get(dbGuild.roles.member);
        if (!memberRole)
            return interaction.reply({
                content: "Member role not setup, let server owner know",
                ephemeral: true,
            });

        const category = guild.channels.cache.get(
            dbGuild.categories.playlists
        ) as CategoryChannelResolvable;

        if (!category)
            return interaction.reply({
                content: "Playlist category not setup, let the server know",
                ephemeral: true,
            });

        if (
            guild.channels.cache.find((ch) =>
                ch.name.includes(
                    `${member.user.username}-${member.user.discriminator}-playlist`
                )
            ) ||
            dbUser.playlists.find((pl) => pl.guildId === guild.id)
        )
            return interaction.reply({
                content:
                    "You already have a playlist created, delete it or use it",
                ephemeral: true,
            });

        const newChannel = await guild.channels.create(
            `${member.user.username}-${member.user.discriminator}-playlist`,
            {
                type: "GUILD_TEXT",
                parent: category,
                permissionOverwrites: [
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                    },
                    {
                        id: memberRole.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                    },
                    {
                        id: member.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                    },
                ],
            }
        );

        dbUser.playlists.push({
            guildId: guild.id,
            channelId: newChannel.id,
            tracks: [],
            sharedWith: [],
        });

        await dbUser.save();

        return interaction.reply({
            content: `Created a playlist for you ${newChannel}`,
            ephemeral: true,
        });
    }

    async queue(interaction: CommandInteraction, member: GuildMember) {
        const dbUser = await this.client.database.users.get(member.user);

        const guild = interaction.guild as Guild;
        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const channel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true,
            });

        if (!voiceChannel)
            return interaction.reply({
                content:
                    "You must be in a voice channel to be able to queue your playlist",
                ephemeral: true,
            });

        if (
            guild.me?.voice.channelId &&
            voiceChannel.id !== guild.me?.voice.channelId
        )
            return interaction.reply({
                content: `I'm already playing music in ${guild.me.voice.channel}`,
                ephemeral: true,
            });

        if (member.voice.deaf)
            return interaction.reply({
                content: "You cannot play music when deafened",
                ephemeral: true,
            });

        let queue = this.client.music.getQueue(guild);

        if (!queue) {
            queue = this.client.music.createQueue(guild, {
                metadata: channel,
            });

            try {
                if (!queue.connection) await queue.connect(voiceChannel);
            } catch {
                queue.destroy();
                return await interaction.reply({
                    content: "Could not join your voice channel",
                    ephemeral: true,
                });
            }
        }

        await interaction.deferReply({
            ephemeral: true,
        });

        const tracks = await Promise.all(
            playlist.tracks.map(async (query) => {
                const track = (
                    await this.client.music.search(query, {
                        requestedBy: member.user,
                    })
                ).tracks[0];
                return track;
            })
        );

        queue.addTracks(tracks);
        if (!queue.playing) queue.play();

        await interaction.followUp({
            content: "Your playlist has been queued",
            ephemeral: true,
        });
        return;
    }

    async add(
        interaction: CommandInteraction | ContextMenuInteraction,
        member: GuildMember,
        message: Message
    ) {
        const dbUser = await this.client.database.users.get(member.user);

        const guild = interaction.guild as Guild;
        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true,
            });

        playlist.tracks.push(message.content.toLowerCase());

        await dbUser.save();

        return interaction.reply({
            content: `**${message.content}** was added to your playlist`,
            ephemeral: true,
        });
    }

    async share(interaction: CommandInteraction, member: GuildMember) {
        const dbUser = await this.client.database.users.get(member.user);
        if (!dbUser.playlist.channelId || dbUser.playlist.channelId.length < 1)
            return interaction.reply({
                content: "You do not own a playlist channel",
                ephemeral: true,
            });
        const guild = interaction.guild as Guild;
        const shareWith = interaction.options.getMember("with") as GuildMember;

        if (dbUser.playlist.sharedWith.includes(shareWith.id))
            return this.unshare(interaction, member);

        const channel = guild.channels.cache.get(
            dbUser.playlist.channelId
        ) as TextChannel;

        dbUser.playlist.sharedWith.push(shareWith.id);

        await channel.permissionOverwrites.edit(shareWith.id, {
            VIEW_CHANNEL: true,
        });

        await dbUser.save();

        return interaction.reply({
            content: `Shared your playlist with ${shareWith}`,
            ephemeral: true,
        });
    }

    async shareContext(
        interaction: ContextMenuInteraction,
        member: GuildMember
    ) {
        const dbUser = await this.client.database.users.get(member.user);

        const guild = interaction.guild as Guild;
        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const shareWith = await guild.members.fetch(interaction.targetId);

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true,
            });

        if (playlist.sharedWith.includes(shareWith.id))
            return this.unshareContext(interaction, member);

        const channel = guild.channels.cache.get(
            playlist.channelId
        ) as TextChannel;

        playlist.sharedWith.push(shareWith.id);

        await channel.permissionOverwrites.edit(shareWith.id, {
            VIEW_CHANNEL: true,
        });

        await dbUser.save();

        return interaction.reply({
            content: `Shared your playlist with ${shareWith}`,
            ephemeral: true,
        });
    }

    async unshare(interaction: CommandInteraction, member: GuildMember) {
        const dbUser = await this.client.database.users.get(member.user);

        const guild = interaction.guild as Guild;
        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const shareWith = interaction.options.getMember("with") as GuildMember;

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true,
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
            ephemeral: true,
        });
    }

    async unshareContext(
        interaction: ContextMenuInteraction,
        member: GuildMember
    ) {
        const dbUser = await this.client.database.users.get(member.user);

        const guild = interaction.guild as Guild;
        const playlist = dbUser.playlists.find(
            (playlist) => playlist.guildId === guild.id
        );
        const shareWith = await guild.members.fetch(interaction.targetId);

        if (!playlist)
            return interaction.reply({
                content: "You do not have a playlist in this server",
                ephemeral: true,
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
            ephemeral: true,
        });
    }

    get = async (member: GuildMember) =>
        (await this.client.database.users.get(member.user)).playlists.find(
            (playlist) => playlist.guildId === member.guild.id
        );
}
