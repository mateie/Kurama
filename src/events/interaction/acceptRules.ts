import Client from '@classes/Client';
import Event from '@classes/base/Event';
import { IEvent } from '@types';
import { ButtonInteraction, Guild, GuildMember, Role } from 'discord.js';

export default class AcceptRulesEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
        this.description = 'Handles the Button for rules';
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        const { customId } = interaction;

        if (!['accept_rules'].includes(customId)) return;

        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;
        const dbGuild = await this.client.database.guilds.get(guild);

        if (!dbGuild.roles.member || dbGuild.roles.member.length < 0) return interaction.reply({ content: 'Member role is not setup, Contact the Server Owner', ephemeral: true });
    
        const role = await guild.roles.cache.get(dbGuild.roles.member) as Role;

        if (member.roles.cache.has(role.id)) return interaction.reply({ content: 'You already a member', ephemeral: true });
        member.roles.add(role);
        return interaction.reply({ content: 'You accepted the rules and became a member, have a good stay', ephemeral: true });
    }
}