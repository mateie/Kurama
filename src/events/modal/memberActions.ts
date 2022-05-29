import Client from '@classes/Client';
import Event from '@classes/base/Event';
import { IEvent } from '@types';
import { Guild, ModalSubmitInteraction } from 'discord.js';

export default class MemberActionsModalEvent extends Event implements IEvent {

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;

        const id = interaction.customId.split('_')[2];

        if (![
            `report_member_${id}`,
            `warn_member_${id}`,
        ].includes(interaction.customId)) return;

        const guild = interaction.guild as Guild;

        const target = await guild.members.fetch(id);

        switch (interaction.customId) {
        case `report_member_${id}`: {
            const reason = interaction.fields.getTextInputValue('report_reason');

            return this.client.moderation.reports.create(interaction, target, reason);
        }
        case `warn_member_${id}`: {
            const reason = interaction.fields.getTextInputValue('warn_reason');
                
            return this.client.moderation.warns.create(interaction, target, reason);
        }
        }
    }
}