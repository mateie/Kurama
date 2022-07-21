import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { userMention } from "@discordjs/builders";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class PlaylistCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "playlist";
        this.description = "Manage Playlists";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand.setName("create").setDescription("Create a playlist")
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("view").setDescription("View your Playlist")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("queue")
                    .setDescription("Queue your Playlist")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("delete")
                    .setDescription("Delete your playlist")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("share")
                    .setDescription("Share your playlist with someone")
                    .addUserOption((option) =>
                        option
                            .setName("with")
                            .setDescription("User you want to share it with")
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);
        const category = guild.channels.cache.get(dbGuild.categories.playlists);
        if (!category)
            return interaction.reply({
                content: "Playlist category not found or not set up",
                ephemeral: true
            });

        switch (options.getSubcommand()) {
            case "create": {
                return this.client.playlists.create(interaction);
            }
            case "queue": {
                return this.client.playlists.queue(interaction);
            }
            case "delete": {
                return this.client.playlists.delete(interaction);
            }
            case "view": {
                return this.client.playlists.view(interaction);
            }
            case "share": {
                return this.client.playlists.share(interaction);
            }
        }
    }
}
