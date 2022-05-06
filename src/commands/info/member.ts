import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';

export default class MemberCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'member';
        this.description = 'Information about a member';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Which user\'s information do you want to view?')
                    .setRequired(false)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember('member') ? options.getMember('member') as GuildMember : interaction.member as GuildMember;

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        return this.client.util.memberInfo(interaction, member);
    }
}