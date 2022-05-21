import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';

export default class XPCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'xp';
        this.description = 'Check your xp';

        this.data
            .setName(this.name)
            .setDescription(this.description);
    }

    async run(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;

        const xp = await this.client.xp.getXP(member);
        const level = await this.client.xp.getLevel(member);
        const requiredXP = this.client.xp.calculateReqXP(level);

        return interaction.reply({ content: `***Level***: ${level} - ***XP***: ${xp} - **Required XP**: ${requiredXP}` });
    }
}