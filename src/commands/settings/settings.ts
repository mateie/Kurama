import {
    CategoryChannel,
    CommandInteraction,
    Guild,
    Role,
    TextChannel,
} from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";
import { ChannelType } from "discord-api-types/v10";
import { channelMention } from "@discordjs/builders";

export default class SettingsCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "settings";
        this.description = "Settings for your server";
        this.permission = "MANAGE_GUILD";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommandGroup((group) =>
                group
                    .setName("categories")
                    .setDescription("Manage your categories in the database")
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("set")
                            .setDescription("Set a category")
                            .addStringOption((option) =>
                                option
                                    .setName("category_type")
                                    .setDescription("Category name")
                                    .setAutocomplete(true)
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("category")
                                    .setDescription("Category to set")
                                    .addChannelTypes(ChannelType.GuildCategory)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("list")
                            .setDescription("List all the categories")
                    )
            )
            .addSubcommandGroup((group) =>
                group
                    .setName("channels")
                    .setDescription("Manage your channels in the database")
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("set")
                            .setDescription("Set a channel")
                            .addStringOption((option) =>
                                option
                                    .setName("channel_type")
                                    .setDescription("Channel name")
                                    .setAutocomplete(true)
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription("Channel to set")
                                    .addChannelTypes(ChannelType.GuildText)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("add")
                            .setDescription("Add a channel to the database")
                            .addStringOption((option) =>
                                option
                                    .setName("channel_type")
                                    .setDescription("For which channel?")
                                    .setAutocomplete(true)
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription("Channel to add")
                                    .addChannelTypes(ChannelType.GuildText)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("remove")
                            .setDescription(
                                "Remove a channel from the database"
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("channel_type")
                                    .setDescription("For which channel?")
                                    .setAutocomplete(true)
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription("Channel to remove")
                                    .addChannelTypes(ChannelType.GuildText)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("list")
                            .setDescription("List all the channels")
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("roles")
                    .setDescription("Change roles in the database")
                    .addStringOption((option) =>
                        option
                            .setName("role_type")
                            .setDescription("Role in the database")
                            .setAutocomplete(true)
                            .setRequired(true)
                    )
                    .addRoleOption((option) =>
                        option
                            .setName("role")
                            .setDescription("Role to assign it to")
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("toggles")
                    .setDescription("Toggle settings for your server")
                    .addStringOption((option) =>
                        option
                            .setName("toggle")
                            .setDescription("Choose a toggle")
                            .setAutocomplete(true)
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        switch (options.getSubcommand()) {
            case "roles": {
                const type = options.getString("role_type", true);
                const role = options.getRole("role", true) as Role;

                dbGuild.roles[type as keyof typeof dbGuild.roles] = role.id;

                await dbGuild.save();

                return interaction.reply({
                    content: `${role} was set to **${this.util.capFirstLetter(
                        type
                    )}** in the database`,
                    ephemeral: true,
                });
            }
            case "toggles": {
                const toggle = options.getString("toggle") as string;

                const oldValue = dbGuild.toggles[
                    toggle as keyof typeof dbGuild.toggles
                ]
                    ? "On"
                    : "Off";

                dbGuild.toggles[toggle as keyof typeof dbGuild.toggles] =
                    !dbGuild.toggles[toggle as keyof typeof dbGuild.toggles];

                await dbGuild.save();

                return interaction.reply({
                    content: `Old Value: **${oldValue}** - New Value: **${
                        dbGuild.toggles[toggle as keyof typeof dbGuild.toggles]
                            ? "On"
                            : "Off"
                    }**`,
                    ephemeral: true,
                });
            }
        }

        switch (options.getSubcommandGroup()) {
            case "categories": {
                const type = options.getString("category_type") as string;
                const category = options.getChannel(
                    "category"
                ) as CategoryChannel;

                switch (options.getSubcommand()) {
                    case "set": {
                        dbGuild.categories[
                            type as keyof typeof dbGuild.categories
                        ] = category.id;

                        await dbGuild.save();

                        return interaction.reply({
                            content: `Set ${
                                category.name
                            } as a **${this.util.capFirstLetter(
                                type
                            )}** Category`,
                            ephemeral: true,
                        });
                    }
                    case "list": {
                        const listed = Object.keys(dbGuild.categories)
                            .map((name) => {
                                const id =
                                    dbGuild.categories[
                                        name as keyof typeof dbGuild.categories
                                    ];
                                return `
                                    \`${name}\`: ${
                                    id ? channelMention(id) : "Not set"
                                }
                                `;
                            })
                            .join("")
                            .trim();

                        const embed = this.util.embed().setDescription(listed);

                        return interaction.reply({
                            embeds: [embed],
                            ephemeral: true,
                        });
                    }
                }
                break;
            }
            case "channels": {
                const type = options.getString("channel_type") as string;
                const channel = options.getChannel("channel") as TextChannel;

                const channelsArray =
                    dbGuild.channelsArray[
                        type as keyof typeof dbGuild.channelsArray
                    ];

                switch (options.getSubcommand()) {
                    case "set": {
                        dbGuild.channels[
                            type as keyof typeof dbGuild.channels
                        ] = channel.id;

                        await dbGuild.save();

                        return interaction.reply({
                            content: `Set ${channel} as a **${this.util.capFirstLetter(
                                type
                            )}** channel`,
                            ephemeral: true,
                        });
                    }
                    case "add": {
                        if (channelsArray.includes(channel.id))
                            return interaction.reply({
                                content: `${channel} is already in **${this.util.capFirstLetter(
                                    type
                                )}** channel list`,
                                ephemeral: true,
                            });

                        channelsArray.push(channel.id);

                        await dbGuild.save();

                        return interaction.reply({
                            content: `Added ${channel} to the **${this.util.capFirstLetter(
                                type
                            )}** channel list`,
                            ephemeral: true,
                        });
                    }
                    case "remove": {
                        if (!channelsArray.includes(channel.id))
                            return interaction.reply({
                                content: `${channel} is not in **${this.util.capFirstLetter(
                                    type
                                )}** channel list`,
                                ephemeral: true,
                            });

                        dbGuild.channelsArray[
                            type as keyof typeof dbGuild.channelsArray
                        ] = channelsArray.filter((ch) => ch !== channel.id);

                        await dbGuild.save();

                        return interaction.reply({
                            content: `Removed ${channel} from the **${this.util.capFirstLetter(
                                type
                            )}** channel list`,
                            ephemeral: true,
                        });
                    }
                    case "list": {
                        const channels = Object.keys(dbGuild.channels)
                            .map((name) => {
                                const id =
                                    dbGuild.channels[
                                        name as keyof typeof dbGuild.channels
                                    ];

                                return `
                                \`${name}\`: ${
                                    id ? channelMention(id) : "Not set"
                                }
                                `;
                            })
                            .join("")
                            .trim();

                        const channelsArray = Object.keys(dbGuild.channelsArray)
                            .map((name) => {
                                const ids =
                                    dbGuild.channelsArray[
                                        name as keyof typeof dbGuild.channelsArray
                                    ];

                                return `
                            \`${name}\`: ${
                                    ids.length > 0
                                        ? ids
                                              .map((id) => channelMention(id))
                                              .join(", ")
                                        : "Not set"
                                }
                            `;
                            })
                            .join("")
                            .trim();

                        const embed = this.util
                            .embed()
                            .setDescription(`${channels}\n\n${channelsArray}`);

                        return interaction.reply({
                            embeds: [embed],
                            ephemeral: true,
                        });
                    }
                }
                break;
            }
        }
    }
}
