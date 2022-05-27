import Client from '@classes/Client';
import { ButtonInteraction, CommandInteraction, Guild, GuildMember, ModalSubmitInteraction } from 'discord.js';

export default class Reports {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
        member: GuildMember,
        reason: string
    ) {
        const guild = interaction.guild as Guild;
        const by = interaction.member as GuildMember;
        const db = await this.client.database.members.get(member);

        db.reports.push({
            guildId: guild.id,
            by: by.id,
            reason
        });

        await db.save();

        return interaction.reply({ content: `You reported ${member} for **${reason}**`, ephemeral: true });
    }

    async get(member: GuildMember) {
        const db = await this.client.database.members.get(member);

        return db.reports.filter(report => report.guildId === member.guild.id);
    }

    total = async (member: GuildMember) => (await this.get(member)).length;
}