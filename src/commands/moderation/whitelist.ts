import { CommandInteraction, Guild } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/base/Command';
import { ICommand } from '@types';

export default class WordCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = 'whitelist';
        this.description = 'Whitelist certain words';

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add a word to the whitelist')
                    .addStringOption(option =>
                        option
                            .setName('word')
                            .setDescription('Word to add to the whitelist (seperate each word with a comma if multiple)')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove a word from the whitelist')
                    .addStringOption(option =>
                        option
                            .setName('word')
                            .setDescription('Word to remove from the whitelist (seperate each word with a comma if multiple)')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('list')
                    .setDescription('List all the words')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;

        const dbGuild = await this.client.database.guilds.get(guild);
        if (!dbGuild.toggles.preventProfanity) return interaction.reply({ content: 'Enable **Profanity Filter**, before using this command', ephemeral: true });

        const word = options.getString('word') as string;

        switch (options.getSubcommand()) {
        case 'add': {
            if (word.split(',').length > 1) {
                const words = word.split(',');
                const exists = await this.client.moderation.whitelist.checkMultiple(words, guild);
                if (exists.length > 0) return interaction.reply({ content: `The word **${this.util.list(exists)}** are already in a whitelist`, ephemeral: true });
                return this.client.moderation.whitelist.addMultiple(interaction, words, guild);
            }
                
            const exists = await this.client.moderation.whitelist.check(word, guild);
            if (exists) return interaction.reply({ content: `The word **${word}** is already in a whitelist`, ephemeral: true });
            return this.client.moderation.whitelist.add(interaction, word, guild);
        }
        case 'remove': {
            if (word.split(',').length > 1) {
                const words = word.split(',');
                const exists = await this.client.moderation.whitelist.checkMultiple(words, guild);
                if (exists.length < 1) return interaction.reply({ content: `The word **${this.util.list(words)}** are not in a whitelist`, ephemeral: true });
                return this.client.moderation.whitelist.removeMultiple(interaction, words, guild);
            }
                
            const exists = await this.client.moderation.whitelist.check(word, guild);
            if (!exists) return interaction.reply({ content: `The word **${word}** is not in a whitelist`, ephemeral: true });
            return this.client.moderation.whitelist.remove(interaction, word, guild);
        }
        case 'list': {
            const list = await this.client.moderation.whitelist.get(guild);
            return interaction.reply({ content: `Current Word Whitelist: **${list.join(', ')}**`, ephemeral: true });
        }
        }
    }
}