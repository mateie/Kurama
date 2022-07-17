import {
    CommandInteraction,
    Guild,
    GuildMember,
    VoiceChannel,
} from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class AnnoyCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "annoy";
        this.description = "Annoy someone";
        this.ownerOnly = true;

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName("member")
                    .setDescription("Who to annoy?")
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
        const voiceState = member.voice;
        const currentChannel = member.voice.channel as VoiceChannel;

        const channels = guild.channels.cache.filter(
            (channel) =>
                channel.permissionsFor(member).has("CONNECT") &&
                channel.type === "GUILD_VOICE"
        );

        const randomChannel = channels.random() as VoiceChannel;
        const randomChannel2 = channels.random() as VoiceChannel;

        if (!randomChannel || !randomChannel2)
            return interaction.reply({
                content: `You have to have 2 channels that ${member} can access`,
                ephemeral: true,
            });

        await interaction.deferReply({ ephemeral: true });

        await voiceState.setChannel(randomChannel);
        await voiceState.setChannel(randomChannel2);
        await voiceState.setChannel(randomChannel);
        await voiceState.setChannel(randomChannel2);
        await voiceState.setChannel(randomChannel);
        await voiceState.setChannel(randomChannel2);
        await voiceState.setChannel(currentChannel);

        await interaction.editReply({
            content: `We tried annoying ${member} up, we hope they did :O`,
        });
    }
}
