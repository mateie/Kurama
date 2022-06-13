import { CommandInteraction, Guild } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";
import { ChannelType } from "discord-api-types/v10";

export default class CategoriesCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "categories";
        this.description = "Set up categories";
        this.permission = "MANAGE_CHANNELS";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("set")
                    .setDescription("Set a category")
                    .addStringOption((option) =>
                        option
                            .setName("type")
                            .setDescription("Category nane")
                            .addChoices({
                                name: "Playlists",
                                value: "playlists",
                            })
                            .setRequired(true)
                    )
                    .addChannelOption((option) =>
                        option
                            .setName("category")
                            .setDescription("Category to set")
                            .addChannelTypes(ChannelType.GuildCategory)
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        const type = options.getString("type", true);
        const category = options.getChannel("category", true);

        const typeList = this.client.util.capFirstLetter(type);

        switch (options.getSubcommand()) {
            case "set": {
                dbGuild.categories[type as keyof typeof dbGuild.categories] =
                    category.id;

                await dbGuild.save();

                return interaction.reply({
                    content: `Set ${category} as a **${typeList}** category`,
                    ephemeral: true,
                });
            }
        }
    }
}
