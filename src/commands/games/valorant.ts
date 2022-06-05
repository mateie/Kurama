import { CommandInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class ValorantCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "valorant";
        this.description = "Valorant Stats";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("login")
                    .setDescription("Login in your valorant account")
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("store").setDescription("Valorant Store")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("wallet")
                    .setDescription("Check your Valorant wallet")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("stats")
                    .setDescription("Check your stats")
                    .addStringOption((option) =>
                        option
                            .setName("stat_type")
                            .setDescription("What kind of stats?")
                            .addChoices(
                                { name: "Gamemodes", value: "gamemodes" },
                                { name: "Agents", value: "agents" }
                            )
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("valorant_tagline")
                            .setDescription("Your Valorant Tagline (Player#NA1)")
                            .setRequired(false)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;

        switch (options.getSubcommand()) {
        case "login": {
            if (this.client.valorant.accounts.has(member.id)) {
                const account = this.client.valorant.accounts.get(member.id);
                return interaction.reply({
                    content: `You already logged in as ${account?.user.GameName}#${account?.user.TagLine}`,
                    ephemeral: true,
                });
            }
            const username = this.util
                .modalRow()
                .addComponents(
                    this.util
                        .input()
                        .setCustomId("valorant_username")
                        .setLabel("Your Username")
                        .setStyle("SHORT")
                        .setMinLength(1)
                        .setMaxLength(100)
                        .setRequired(true)
                );

            const password = this.util
                .modalRow()
                .addComponents(
                    this.util
                        .input()
                        .setCustomId("valorant_password")
                        .setLabel("Your Password")
                        .setStyle("SHORT")
                        .setPlaceholder("WE DO NOT STORE IT")
                        .setMinLength(1)
                        .setMaxLength(100)
                        .setRequired(true)
                );

            const region = this.util
                .modalRow()
                .addComponents(
                    this.util
                        .input()
                        .setCustomId("valorant_region")
                        .setLabel("Your Region")
                        .setStyle("SHORT")
                        .setPlaceholder("NA/EU/KR and etc.")
                        .setMinLength(2)
                        .setMaxLength(2)
                        .setRequired(true)
                );

            const modal = this.util
                .modal()
                .setCustomId("valorant_login")
                .setTitle("Login to your Valorant Account")
                .addComponents(username)
                .addComponents(password)
                .addComponents(region);

            return interaction.showModal(modal);
        }
        case "store": {
            return this.client.valorant.getStore(interaction);
        }
        case "wallet": {
            return this.client.valorant.getWallet(interaction);
        }
        case "stats": {
            const statType = options.getString("stat_type", true);
            switch (statType) {
            case "gamemodes": {
                return this.client.valorant.getStats(interaction);
            }
            case "agents": {
                return this.client.valorant.getAgents(interaction);
            }
            }
        }
        }
    }
}
