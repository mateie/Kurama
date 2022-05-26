import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';

import colornames from 'colornames';
import isHexColor from 'is-hex-color';

export default class CardCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'card';
        this.description = 'Customize your profile card';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option
                    .setName('element')
                    .setDescription('What do you want to customize')
                    .addChoices(
                        { name: 'Background', value: 'background' }
                    )
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('color')
                    .setDescription('What color do you want it to be?')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;

        const element = options.getString('element') as string;
        const color = options.getString('color') as string;

        let hex;

        if (!isHexColor(color)) hex = colornames(color);

        if (!hex) return interaction.reply({ content: `${color} is not a color`, ephemeral: true });

        const db = await this.client.database.members.get(member);
        db.card[element as keyof typeof db.card] = hex;

        await db.save();

        return interaction.reply({ content: `Your profile card ***${element}*** was changed to **${color}**`, ephemeral: true });
    }
}