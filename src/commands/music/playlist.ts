import { CommandInteraction, Guild, GuildMember } from "discord.js";
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
            .addSubcommand(subcommand =>
                subcommand
                    .setName("create")
                    .setDescription("Create a playlist")
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);
        const category = guild.channels.cache.get(dbGuild.channels.playlists);
        if (!category) return interaction.reply({ content: "Playlist category not found or not set up", ephemeral: true });

        const member = interaction.member as GuildMember;

        switch (options.getSubcommand()) {
        case "create": {
            return this.client.playlists.create(interaction, member);
        }
        }
    }
}