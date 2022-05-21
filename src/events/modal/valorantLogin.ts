import Client from '@classes/Client';
import Event from '@classes/base/Event';
import { IEvent } from '@types';
import { Region } from '@survfate/valorant.js';
import { ModalSubmitInteraction } from 'discord.js';

export default class ValorantLoginEvent extends Event implements IEvent {

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ModalSubmitInteraction) {
        const { customId } = interaction;
        
        if (customId !== 'valorant_login') return;

        const username = interaction.fields.getTextInputValue('valorant_username');
        const password = interaction.fields.getTextInputValue('valorant_password');
        let region: string | Region = interaction.fields.getTextInputValue('valorant_region').toUpperCase();
        region = Region[region as keyof typeof Region];

        return this.client.valorant.login(interaction, { username, password, region }); 
    }
}