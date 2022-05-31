import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';

import toHex from 'colornames';
import fromHex from 'color-namer';
import isHexColor from 'is-hex-color';

export default class CardCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'card';
        this.description = 'Customize your profile card';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommandGroup(group =>
                group
                    .setName('background')
                    .setDescription('Change your background')
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('banner')
                            .setDescription('Uses your banner as a background')
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('color')
                            .setDescription('Use a color for your background')
                            .addStringOption(option =>
                                option
                                    .setName('color')
                                    .setDescription('Color to set it to')
                            )
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('image')
                            .setDescription('Use an image as a background')
                            .addAttachmentOption(option =>
                                option
                                    .setName('bg_image')
                                    .setDescription('Background image')                   
                            )
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;
        await member.user.fetch();

        const dbMember = await this.client.database.members.get(member);

        switch (options.getSubcommand()) {
        case 'banner': {
            if (dbMember.card.type === 'banner') return interaction.reply({ content: 'Your background is already using your banner', ephemeral: true });
            const banner = member.user.banner;
            if (!banner) return interaction.reply({ content: 'You don\'t have a banner', ephemeral: true });
            dbMember.card.type = 'banner';
            
            await dbMember.save();

            return interaction.reply({ content: 'Your background will be your banner from now on', ephemeral: true });
        }
        case 'color': {
            const color = options.getString('color');
            dbMember.card.type = 'color';
            if (!color) {
                await dbMember.save();
                const colorName = fromHex(dbMember.card.background.color);
                if (dbMember.card.type === 'color') return interaction.reply({ content: `Your background is already using a color, **Current Color**: ${colorName}`, ephemeral: true });
                return interaction.reply({ content: `Switched the background to a color, **Current Color**: ${colorName}`, ephemeral: true });
            };
            let hex: string = color;
            if (!isHexColor(color)) hex = toHex(color) as string;
            if (!hex) return interaction.reply({ content: `${color} is not a color`, ephemeral: true });
                
            dbMember.card.background.color = hex;

            await dbMember.save();

            return interaction.reply({ content: `Your background was changed to **${color}** `, ephemeral: true });
        }
        case 'image': {
            let attachment = options.getAttachment('bg_image');
            dbMember.card.type = 'image';
            if (!attachment) {
                if (!dbMember.card.background.image) return interaction.reply({ content: 'You don\'t have any images uploaded as your background before', ephemeral: true });
                attachment = this.client.util.attachment(dbMember.card.background.image, 'current_image.png');
                await dbMember.save();
                if(dbMember.card.type === 'image') return interaction.reply({ files: [this.client.util.attachment(dbMember.card.background.image, 'current_image.png')], content: 'Your backgroud is already using an image, ***Current Image Below***', ephemeral: true });
                return interaction.reply({ files: [attachment], content: 'Switched the background to an image, **Current image below**', ephemeral: true });
            }
            if (!attachment.contentType?.includes('image') || attachment.contentType === 'image/gif') return interaction.reply({ content: 'File has to be an image', ephemeral: true });
            const imageBuffer = await this.client.util.imageToBuffer(attachment.url);
            dbMember.card.background.image = imageBuffer;

            await dbMember.save();

            return interaction.reply({ files: [attachment], content: 'Your background was changed to ***Image below***', ephemeral: true });
            break;
        }
        }
    }
}