import { CommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class WakeEmUpCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "wakeemup";
        this.description = "Wake someone up who is deafened in the vc";

        this.permission = "MOVE_MEMBERS";

        this.global = false;

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName("member")
                    .setDescription("Member to wake up")
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;
        const target = options.getMember("member") as GuildMember;

        if (!target.voice.channelId)
            return interaction.reply({
                content: "Member is not in a voice channel",
                ephemeral: true,
            });
        if (!target.voice.selfDeaf)
            return interaction.reply({
                content: "Member is not deafened",
                ephemeral: true,
            });

        const voiceState = target.voice;
        const currentChannel = target.voice.channel as VoiceChannel;
        const randomChannel = interaction.guild?.channels.cache
            .filter(
                (channel) =>
                    channel.permissionsFor(member).has("CONNECT") &&
                    channel.type === "GUILD_VOICE"
            )
            .random() as VoiceChannel;

        if (currentChannel.equals(randomChannel))
            return interaction.reply({
                content:
                    "Retry the command or create a temporary voice channel",
                ephemeral: true,
            });

        await interaction.deferReply({ ephemeral: true });

        await voiceState.setChannel(randomChannel);
        await voiceState.setChannel(currentChannel);
        await voiceState.setChannel(randomChannel);
        await voiceState.setChannel(currentChannel);
        await voiceState.setChannel(randomChannel);
        await voiceState.setChannel(currentChannel);

        interaction.editReply({
            content: "We tried waking them up, We hope they did :O",
        });
    }
}
