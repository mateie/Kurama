import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';

export default class EmitCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'emit';
        this.description = 'Event Emitter';
        this.permission = 'ADMINISTRATOR';

        this.ownerOnly = true;

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(subcommand =>
                subcommand
                    .setName('member')
                    .setDescription('Member Events')
                    .addStringOption(option =>
                        option
                            .setName('event')
                            .setDescription('Guild Member Events')
                            .addChoices(
                                { name: 'Member Joining', value: 'guildMemberAdd' },
                                { name: 'Member Leaving', value: 'guildMemberRemove' },
                                { name: 'Member Available', value: 'guildMemberAvailable' },
                                { name: 'Member Update', value: 'guildMemberUpdate' },
                            )
                            .setRequired(true)
                    )
                    .addUserOption(option =>
                        option
                            .setName('member_emit')
                            .setDescription('Member to emit it from')
                            .setRequired(false)
                    
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;
        const choices = options.getString('event') as string;
        switch (options.getSubcommand()) {
        case 'member': {
            const member = options.getMember('member_emit') ? options.getMember('member_emit') as GuildMember : interaction.member as GuildMember;
            this.client.emit(choices, member);
        }
        }

        await interaction.reply({ content: 'Emitted', ephemeral: true });
    }
}
