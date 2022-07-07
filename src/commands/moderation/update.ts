import { CommandInteraction, Guild, TextChannel } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class UpdateCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "update";
        this.description = "Update certain things for the server";

        this.permission = "MANAGE_GUILD";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("rules")
                    .setDescription(
                        "Update rules in assigned rules channel (grabs first message from the channel)"
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const db = await this.client.database.guilds.get(guild);

        switch (options.getSubcommand()) {
            case "rules": {
                if (!db.channels.rules)
                    return interaction.reply({
                        content:
                            "Rules channel is not set up, set it up with /channels",
                    });
                const channel = guild.channels.cache.get(
                    db.channels.rules
                ) as TextChannel;
                const messages = (await channel.messages.fetch()).filter(
                    (message) => !message.author.bot
                );
                if (!messages || messages.size < 1)
                    return interaction.reply({
                        content: "No messages found in your rules channel",
                        ephemeral: true,
                    });
                const rules = messages
                    .map((message) => message.content)
                    .join("\n\n");
                const embed = this.util
                    .embed()
                    .setTitle(`${guild.name} Rules`)
                    .setDescription(rules);

                const row = this.util
                    .row()
                    .setComponents(
                        this.util
                            .button()
                            .setCustomId("accept_rules")
                            .setLabel("Accept Rules")
                            .setStyle("SUCCESS")
                    );

                messages.forEach((message) => message.delete());

                await interaction.reply({
                    content: "Rules updated",
                    ephemeral: true,
                });

                return channel.send({ embeds: [embed], components: [row] });
            }
        }
    }
}
