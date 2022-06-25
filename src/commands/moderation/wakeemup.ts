import {
    CommandInteraction,
    Guild,
    GuildMember,
    VoiceChannel,
} from "discord.js";
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

        const guild = interaction.guild as Guild;
        const member = options.getMember("member") as GuildMember;

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true,
            });

        if (!member.voice.channelId)
            return interaction.reply({
                content: `${member} is not in a voice channel`,
                ephemeral: true,
            });
        if (!member.voice.deaf)
            return interaction.reply({
                content: `${member} is not deafened`,
                ephemeral: true,
            });

        const voiceState = member.voice;
        const currentChannel = member.voice.channel as VoiceChannel;
        const randomChannel = guild.channels.cache
            .filter(
                (channel) =>
                    channel.permissionsFor(member).has("CONNECT") &&
                    channel.type === "GUILD_VOICE" &&
                    channel.id !== currentChannel.id
            )
            .random() as VoiceChannel;

        if (!randomChannel)
            return interaction.reply({
                content: `You have one channel that ${member} can access`,
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
