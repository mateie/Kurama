import {
    CommandInteraction,
    Guild,
    GuildMember,
    TextChannel,
    VoiceChannel
} from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class MusicCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "music";
        this.description = "Music System";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("play")
                    .setDescription("Play Tracks")
                    .addStringOption((option) =>
                        option
                            .setName("query")
                            .setDescription("Track/Playlist URL or a name")
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("pause").setDescription("Pause the track")
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("resume").setDescription("Resume the track")
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("stop").setDescription("Stop the player")
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("queue").setDescription("View current queue")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("skip")
                    .setDescription("Skip a track/to a track")
                    .addNumberOption((option) =>
                        option
                            .setName("to")
                            .setDescription("Position of a track")
                            .setRequired(false)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("shuffle")
                    .setDescription("Shuffle the queue")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("seek")
                    .setDescription("Seek to a certain duration")
                    .addStringOption((option) =>
                        option
                            .setName("duration")
                            .setDescription(
                                "Duration to seek to (3:00, 1:03...)"
                            )
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("volume")
                    .setDescription("Change volume for the player")
                    .addIntegerOption((option) =>
                        option
                            .setName("percent")
                            .setDescription("Volume to set (0-100)")
                            .setRequired(true)
                            .setMinValue(0)
                            .setMaxValue(100)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;
        const channel = interaction.channel as TextChannel;

        const voiceChannel = member.voice.channel as VoiceChannel;

        if (!voiceChannel)
            return interaction.reply({
                content:
                    "You must be in a voice channel to be able to use the music commands",
                ephemeral: true
            });

        if (
            guild.me?.voice.channelId &&
            voiceChannel.id !== guild.me.voice.channelId
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

        switch (options.getSubcommand()) {
            case "play": {
                if (!queue) {
                    queue = this.client.music.createQueue(guild, {
                        metadata: channel
                    });

                    try {
                        if (!queue.connection)
                            await queue.connect(voiceChannel);
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

                const query = options.getString("query") as string;
                const result = await this.client.music.search(query, {
                    requestedBy: interaction.user
                });

                if (!result.tracks[0]) {
                    await interaction.followUp({
                        content: `Track **${query} was not found`
                    });
                    break;
                }

                if (result.playlist) queue.addTracks(result.playlist.tracks);
                else queue.addTrack(result.tracks[0]);

                if (!queue.playing) queue.play();

                await interaction.followUp({
                    content: "Track/Playlist Recieved",
                    ephemeral: true
                });

                break;
            }
            case "pause": {
                if (!queue)
                    return interaction.reply({
                        content: "Music is not playing",
                        ephemeral: true
                    });

                if (queue.connection.status === "paused")
                    return interaction.reply({
                        content: "Music is already paused",
                        ephemeral: true
                    });

                queue.setPaused(true);
                return interaction.reply({
                    content: "Track paused",
                    ephemeral: true
                });
            }
            case "resume": {
                if (!queue)
                    return interaction.reply({
                        content: "Music is not playing",
                        ephemeral: true
                    });

                if (queue.connection.status === "playing")
                    return interaction.reply({
                        content: "Music is already playing",
                        ephemeral: true
                    });

                queue.setPaused(false);
                return interaction.reply({
                    content: "Track resumed",
                    ephemeral: true
                });
            }
            case "stop": {
                if (!member.permissions.has("MOVE_MEMBERS"))
                    return interaction.reply({
                        content:
                            "You cannot stop the player, not enough permissions",
                        ephemeral: true
                    });

                if (!queue)
                    return interaction.reply({
                        content: "Music is not playing",
                        ephemeral: true
                    });

                queue.stop();
                return interaction.reply({
                    content: "Music has been stopped",
                    ephemeral: true
                });
            }
            case "queue": {
                if (!queue)
                    return interaction.reply({
                        content: "Music is not playing",
                        ephemeral: true
                    });

                const mapped = queue.tracks.map((track, index) => {
                    return `\`${index + 1}\`. ${track.author} - ${
                        track.title
                    } | ${track.duration}`;
                });

                const chunked = this.util.chunk(mapped, 10);

                if (chunked.length < 1)
                    return await interaction.reply({
                        content: "There are no upcoming tracks",
                        ephemeral: true
                    });

                this.util.pagination.default(
                    interaction,
                    chunked,
                    "Upcoming Tracks"
                );
                break;
            }
            case "skip": {
                if (!queue)
                    return interaction.reply({
                        content: "Music is not playing",
                        ephemeral: true
                    });
                if (queue.tracks.length < 1) {
                    return interaction.reply({
                        content: "There are no upcoming tracks to skip to",
                        ephemeral: true
                    });
                }

                const currentTrack = queue.nowPlaying();
                const requestedBy = guild.members.cache.get(
                    currentTrack.requestedBy.id
                ) as GuildMember;
                if (currentTrack.requestedBy.id !== member.id)
                    return interaction.reply({
                        content: `You didn't request this track, ask ${requestedBy} to skip the track, because they requested it`,
                        ephemeral: true
                    });

                const position = options.getNumber("to");
                if (!position) {
                    queue.skip();
                    return interaction.reply({
                        content: "Current track skipped"
                    });
                }
                const skipTo = position - 1;
                const track = queue.tracks[skipTo];
                queue.skipTo(skipTo);
                return interaction.reply({
                    content: `Skipped to: **${track.author} - ${track.title}**`,
                    ephemeral: true
                });
            }
            case "shuffle": {
                if (!queue)
                    return interaction.reply({
                        content: "Music is not playing",
                        ephemeral: true
                    });

                if (queue.tracks.length < 2)
                    return await interaction.reply({
                        content: "There are no upcoming tracks",
                        ephemeral: true
                    });

                return interaction.reply({
                    content: "Queue shuffled",
                    ephemeral: true
                });
            }
            case "seek": {
                if (!queue)
                    return interaction.reply({
                        content: "Music is not playing",
                        ephemeral: true
                    });

                const duration = options.getString("duration") as string;
                const durationPattern = /^[0-5]?[0-9](:[0-5][0-9]){1,2}$/;
                if (!durationPattern.test(duration))
                    return interaction.reply({
                        content: "Duration provided in incorrect format"
                    });

                const durationMs = this.util.durationMs(duration);
                if (durationMs > queue.current.durationMS)
                    return interaction.reply({
                        content: "Duration you provided exceeds track duration",
                        ephemeral: true
                    });

                queue.seek(durationMs);
                return interaction.reply({
                    content: `Seeked to ${duration}`,
                    ephemeral: true
                });
            }
        }
    }
}
