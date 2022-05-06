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
        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName('member')
                    .setDescription('Guild Member')
                    .addChoices(
                        {
                            name: 'Member Joining',
                            value: 'guildMemberAdd',
                        },
                        {
                            name: 'Member Leaving',
                            value: 'guildMemberRemove',
                        }
                    )
                    .setRequired(true)
            );
    }

    run(interaction: CommandInteraction) {
        const choices = interaction.options.getString('member') as string;
        const member = interaction.member as GuildMember;
        switch (choices) {
        case 'guildMemberAdd':
            this.client.emit('guildMemberAdd', member);
            break;
        case 'guildMemberRemove':
            this.client.emit('guildMemberRemove', member);
            break;
        }

        interaction.reply({ content: 'Emitted', ephemeral: true });
    }
}
