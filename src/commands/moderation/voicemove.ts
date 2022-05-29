import { CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';
import { ChannelType } from 'discord-api-types/v10';

export default class VoiceMoveCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'voicemove';
        this.description = 'Move all members to a different voice channel';
        this.permission = 'MOVE_MEMBERS';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('Channel to move to')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;

        const currentVc = member.voice.channel as VoiceChannel;
        const newVc = options.getChannel('channel') as VoiceChannel;

        if (!currentVc) return interaction.reply({ content: 'You have to be in a voice channel to move memebers', ephemeral: true });
        if (currentVc.equals(newVc)) return interaction.reply({ content: 'You cannot move members to the same channel', ephemeral: true });

        currentVc.members.forEach(m => m.voice.setChannel(newVc, `Moved by ${member}`));

        return interaction.reply({ content: `Moved all the members to ${newVc}`, ephemeral: true });
    }
}