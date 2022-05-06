import { CommandInteraction, Guild, Message, Role, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';
import { ChannelType } from 'discord-api-types/v10';

export default class SetupCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'setup';
        this.description = 'Setup certain aspect for you server';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(subcommand =>
                subcommand
                    .setName('rules')
                    .setDescription('Setup Rules')
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription('Channel where Rules will be posted/are')
                            .addChannelTypes(ChannelType.GuildText)
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('roles')
                    .setDescription('Setup Roles')
                    .addStringOption(option =>
                        option
                            .setName('db_role')
                            .setDescription('Which Role to setup?')
                            .setChoices(
                                { name: 'Member', value: 'member' }
                            )
                            .setRequired(true)
                    )
                    .addRoleOption(option =>
                        option
                            .setName('role')
                            .setDescription('Role to assign it to')
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        switch (options.getSubcommand()) {
        case 'rules': {
            const channel = options.getChannel('channel') as TextChannel;
            if (dbGuild.channels.rules && dbGuild.channels.rules.length > 0) return interaction.reply({ content: 'Rules are already setup', ephemeral: true });

            await channel.messages.fetch();
                
            if (channel.messages.cache.size < 1) return interaction.reply({ content: `${channel} has no messages, write rules in the channel and it will automatically set itself up. ***Last message is always the one that gets picked***`, ephemeral: true });
        
            const message = channel.messages.cache.last() as Message;
                
            if (message.deletable) await message.delete();
                
            const embed = this.client.util.embed()
                .setDescription(message.content);
                
            const row = this.client.util.row().setComponents(this.client.util.button().setCustomId('accept_rules').setLabel('Accept Rules').setStyle('SUCCESS'));
                
            await channel.send({ embeds: [embed], components: [row] });
                
            dbGuild.channels.rules = channel.id;
                
            await dbGuild.save();
                
            return interaction.reply({ content: `Finished setting up rules in ${channel}`, ephemeral: true });
        }
        case 'roles': {
            const dbRole = options.getString('db_role') as string;
            const role = options.getRole('role') as Role;

            if (dbGuild.roles[dbRole as keyof typeof dbGuild.roles] && dbGuild.roles[dbRole as keyof typeof dbGuild.roles].length > 0) return interaction.reply({ content: `${this.client.util.capFirstLetter(dbRole)} Role is already setup`, ephemeral: true });
                
            dbGuild.roles[dbRole as keyof typeof dbGuild.roles] = role.id;

            await dbGuild.save();

            return interaction.reply({ content: `Assigned **${dbRole}** to ${role} in the database`, ephemeral: true });

        }
        }
    }
}