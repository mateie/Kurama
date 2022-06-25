import {
    ContextMenuInteraction,
    Guild,
    GuildMember,
    VoiceChannel,
} from "discord.js";
import Client from "@classes/Client";
import Menu from "@classes/base/Menu";
import { IMenu } from "@types";

export default class WakeEmUpMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.name = "Wake Em Up";
        this.permission = "MOVE_MEMBERS";

        this.data.setName(this.name).setType(2);
    }

    async run(interaction: ContextMenuInteraction) {
        const guild = interaction.guild as Guild;
        const member = guild.members.cache.get(
            interaction.targetId
        ) as GuildMember;

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
                    channel.type === "GUILD_VOICE"
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

        await interaction.editReply({
            content: `We tried waking ${member} up, we hope they did :O`,
        });
    }
}
