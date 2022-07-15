import {
    CommandInteraction,
    Guild,
    GuildMember,
    VoiceChannel
} from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class WakeEmUpCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "wakeemup";
        this.description = "Wake someone up who is deafened in the vc";

        this.permission = ["MOVE_MEMBERS"];

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName("member")
                    .setDescription("Member to wake up")
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName("times")
                    .setDescription("Amount of times they get moved")
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const member = options.getMember("member") as GuildMember;

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true
            });

        if (!member.voice.channelId)
            return interaction.reply({
                content: `${member} is not in a voice channel`,
                ephemeral: true
            });
        if (!member.voice.selfDeaf)
            return interaction.reply({
                content: `${member} is not deafened`,
                ephemeral: true
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
                ephemeral: true
            });

        await interaction.deferReply({ ephemeral: true });

        let times = options.getInteger("times");

        if (!times) times = 3;

        if (times < 1)
            return interaction.reply({
                content: "Min number of times is 1",
                ephemeral: true
            });
        if (times > 6)
            return interaction.reply({
                content: "Max number of times is 6",
                ephemeral: true
            });

        for (let i = 0; i <= times; i++) {
            await voiceState.setChannel(randomChannel);
            await voiceState.setChannel(randomChannel2);
        }

        await voiceState.setChannel(currentChannel);

        await interaction.editReply({
            content: `We tried waking ${member} up, we hope they did :O`
        });
    }
}
