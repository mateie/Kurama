import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';
import { ChannelType } from 'discord-api-types/v10';
import { CommandInteraction, Guild, TextChannel } from 'discord.js';

import { channelMention } from '@discordjs/builders';

export default class ChannelsCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'channels';
        this.description = 'Add or Remove Channels from the database';
        this.permission = 'MANAGE_GUILD';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add a channel to the database')
                    .addStringOption(option =>
                        option
                            .setName('type')
                            .setDescription('For Which channel?')
                            .addChoices(
                                { name: 'Commands', value: 'commands' },
                                { name: 'Music', value: 'music' },
                            )
                            .setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription('Channel to add')
                            .addChannelTypes(ChannelType.GuildText)
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Set a channel in a database')
                    .addStringOption(option =>
                        option
                            .setName('type')
                            .setDescription('Channel name')
                            .addChoices(
                                { name: 'Welcome', value: 'welcome' },
                                { name: 'Goodbye', value: 'goodbye' },
                                { name: 'Rules', value: 'rules' },
                                { name: 'Reports', value: 'reports' }
                            )
                            .setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription('Channel to set')
                            .addChannelTypes(ChannelType.GuildText)
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove a channel from the database')
                    .addStringOption(option =>
                        option
                            .setName('type')
                            .setDescription('For Which channel?')
                            .addChoices(
                                { name: 'Commands', value: 'commands'},
                                { name: 'Music', value: 'music' },
                            )
                            .setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription('Channel to remove')
                            .addChannelTypes(ChannelType.GuildText)
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('list')
                    .setDescription('List all the channels')
                    .addStringOption(option =>
                        option
                            .setName('type')
                            .setDescription('For Which channel?')
                            .addChoices(
                                { name: 'Commands', value: 'commands'},
                                { name: 'Music', value: 'music' },
                            )
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        const type = options.getString('type') as string;
        const channel = options.getChannel('channel') as TextChannel;
        const channels = dbGuild.channelsArray[type as keyof typeof dbGuild.channelsArray];

        const typeList = this.client.util.capFirstLetter(type);

        switch (options.getSubcommand()) {
        case 'add': {
            if (channels.includes(channel.id)) return interaction.reply({ content: `${channel} is already in **${typeList}** Channel List`, ephemeral: true });
            channels.push(channel.id);
                
            await dbGuild.save();
                
            return interaction.reply({ content: `Added ${channel} to the **${typeList}** Channel List`, ephemeral: true });
        }
        case 'set': {
            dbGuild.channels[type as keyof typeof dbGuild.channels] = channel.id;
                
            await dbGuild.save();

            return interaction.reply({ content: `Set ${channel} as a **${typeList}** channel`, ephemeral: true});
        }
        case 'remove': {
            if (!channels.includes(channel.id)) return interaction.reply({ content: `${channel} is not in **${typeList}** Channel List`, ephemeral: true });
            dbGuild.channelsArray[type as keyof typeof dbGuild.channelsArray] = channels.filter(ch => ch !== channel.id);
                
            await dbGuild.save();

            return interaction.reply({ content: `Removed ${channel} from the **${typeList}** Channel List`, ephemeral: true });
        }
        case 'list': {
            if (channels.length < 1) return interaction.reply({ content: `There are no channels for **${typeList}** Channel List`, ephemeral: true });
            const listChannels = channels.map(id => channelMention(id)).join(', ');
            
            const embed = this.util.embed()
                .setTitle(`${typeList} Channel List`)
                .setDescription(listChannels);
                
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        }
    }
}