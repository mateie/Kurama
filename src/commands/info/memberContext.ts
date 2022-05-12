import { ContextMenuInteraction, Guild, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Menu from '@classes/base/Menu';
import { IMenu } from '@types';

export default class MemberContextMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.name = 'Member Info';

        this.data
            .setName(this.name)
            .setType(2);
    }

    async run(interaction: ContextMenuInteraction) {
        const guild = interaction.guild as Guild;
        const member = await guild.members.fetch(interaction.targetId) as GuildMember;

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        return this.client.util.member.info(interaction, member);
    }
}