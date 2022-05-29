import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';

export default class ReportCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'report';
        this.description = 'Report a Member';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to report')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason to report this member')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember('member') as GuildMember;
        const reason = options.getString('reason') || 'No reason specified';

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        return this.client.moderation.reports.create(interaction, member, reason);
    }
}