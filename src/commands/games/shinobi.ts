import { CommandInteraction } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class ShinobiCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "sh";
        this.description = "Shinobi Adventure Game";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("start")
                    .setDescription("Start your adventure")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("info")
                    .setDescription("Shinobi Info")
                    .addUserOption((option) =>
                        option
                            .setName("shinobi")
                            .setDescription("Shinobi to check the info of")
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("delete")
                    .setDescription("Delete someone's progress")
                    .addUserOption((option) =>
                        option
                            .setName("shinobi")
                            .setDescription("Shinobi to delete the progress of")
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("clans")
                    .setDescription("Shinobi Clans")
                    .addStringOption((option) =>
                        option
                            .setName("clan")
                            .setDescription("Clan to view")
                            .setAutocomplete(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("villages")
                    .setDescription("Shinobi Villages")
                    .addStringOption((option) =>
                        option
                            .setName("village")
                            .setDescription("Village to view")
                            .setAutocomplete(true)
                    )
            )
            .addSubcommandGroup((group) =>
                group
                    .setName("weapons")
                    .setDescription("Weapon System")
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("view")
                            .setDescription("View a weapon")
                            .addStringOption((option) =>
                                option
                                    .setName("weapon")
                                    .setDescription("Weapon to view")
                                    .setAutocomplete(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("buy")
                            .setDescription("Buy a weapon")
                            .addStringOption((option) =>
                                option
                                    .setName("weapon")
                                    .setDescription("Weapon to buy")
                                    .setAutocomplete(true)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("sell")
                            .setDescription("Sell a weapon")
                            .addStringOption((option) =>
                                option
                                    .setName("weapon")
                                    .setDescription("Weapon to sell")
                                    .setAutocomplete(true)
                                    .setRequired(true)
                            )
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("daily")
                    .setDescription("Claim your daily reward")
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        switch (options.getSubcommandGroup()) {
            case "weapons": {
                const weaponStr = options.getString("weapon") as string;

                switch (options.getSubcommand()) {
                    case "view": {
                        if (!weaponStr)
                            return this.client.games.shinobi.weapons.pagination(
                                interaction
                            );

                        const weapon =
                            this.client.games.shinobi.weapons.get(weaponStr);

                        if (!weapon)
                            return interaction.reply({
                                content: "Weapon not found",
                                ephemeral: true
                            });

                        const embed =
                            this.client.games.shinobi.weapons.embed(weapon);

                        return interaction.reply({ embeds: [embed] });
                    }
                    case "buy":
                    case "sell": {
                        return interaction.reply({
                            content: "Work in progress features",
                            ephemeral: true
                        });
                    }
                }
            }
        }

        switch (options.getSubcommand()) {
            case "start": {
                return this.client.games.shinobi.start(interaction);
            }
            case "info": {
                return this.client.games.shinobi.info(interaction);
            }
            case "delete": {
                return this.client.games.shinobi.delete(interaction);
            }
            case "daily": {
                return this.client.games.shinobi.daily(interaction);
            }
            case "clans": {
                const clanStr = options.getString("clan");

                if (!clanStr) {
                    return this.client.games.shinobi.clans.pagination(
                        interaction
                    );
                }

                const clan = this.client.games.shinobi.clans.get(clanStr);

                if (!clan)
                    return interaction.reply({
                        content: "Clan not found",
                        ephemeral: true
                    });

                const embed = this.client.games.shinobi.clans.embed(clan);

                return interaction.reply({ embeds: [embed] });
            }
            case "villages": {
                const villageStr = options.getString("village");

                if (!villageStr)
                    return this.client.games.shinobi.villages.pagination(
                        interaction
                    );

                const village =
                    this.client.games.shinobi.villages.get(villageStr);

                if (!village)
                    return interaction.reply({
                        content: "Village not found",
                        ephemeral: true
                    });

                const embed = this.client.games.shinobi.villages.embed(village);

                return interaction.reply({ embeds: [embed] });
            }
        }
    }
}
