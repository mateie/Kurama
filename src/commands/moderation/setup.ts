import {
    CommandInteraction,
    Guild,
    Message,
    Role,
    TextChannel,
} from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";
import { ChannelType } from "discord-api-types/v10";

export default class SetupCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "setup";
        this.description = "Setup certain aspect for you server";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("channels")
                    .setDescription(
                        "Setup Channels (if you want to set a specific channel, use /channels)"
                    )
                    .addStringOption((option) =>
                        option
                            .setName("channel")
                            .setDescription("Channel to setup")
                            .addChoices(
                                {
                                    name: "Welcome",
                                    value: "welcome",
                                },
                                {
                                    name: "Goodbye",
                                    value: "goodbye",
                                },
                                {
                                    name: "Playlists",
                                    value: "playlists",
                                }
                            )
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("roles")
                    .setDescription("Setup Roles")
                    .addStringOption((option) =>
                        option
                            .setName("db_role")
                            .setDescription("Which Role to setup?")
                            .setChoices({
                                name: "Member",
                                value: "member",
                            })
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
                    .setName("rules")
                    .setDescription("Setup Rules Channel")
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription("Channel to set it up to")
                            .addChannelTypes(ChannelType.GuildText)
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        switch (options.getSubcommand()) {
            case "channels": {
                const channelName = options.getString("channel") as string;
                const channel = guild.channels.cache.find((ch) =>
                    ch.name.includes(channelName)
                );
                const type = this.util.capFirstLetter(channelName);

                if (!channel)
                    return interaction.reply({
                        content: `Couldn't find **#${channelName}** text channel or similar to it, either set this up with **/channels** or create the channel`,
                        ephemeral: true,
                    });
                if (
                    dbGuild.channels[
                        channelName as keyof typeof dbGuild.channels
                    ] &&
                    dbGuild.channels[
                        channelName as keyof typeof dbGuild.channels
                    ].length > 0
                )
                    return interaction.reply({
                        content: `**${type}** channel is already setup`,
                        ephemeral: true,
                    });

                dbGuild.channels[channelName as keyof typeof dbGuild.channels] =
                    channel.id;
                await dbGuild.save();

                return interaction.reply({
                    content: `**${type}** channel setup finished`,
                    ephemeral: true,
                });
                break;
            }
            case "rules": {
                const channel = options.getChannel("channel") as TextChannel;
                if (dbGuild.channels.rules && dbGuild.channels.rules.length > 0)
                    return interaction.reply({
                        content:
                            "Rules are already setupm use /update to update it",
                        ephemeral: true,
                    });

                await channel.messages.fetch();

                if (channel.messages.cache.size < 1)
                    return interaction.reply({
                        content: `${channel} has no messages, write rules in the channel and it will automatically set itself up. ***Last message is always the one that gets picked***`,
                        ephemeral: true,
                    });

                const message = channel.messages.cache.last() as Message;

                if (message.content.length < 1)
                    return interaction.reply({
                        content: "Message is not valid",
                        ephemeral: true,
                    });

                if (message.deletable) await message.delete();

                const embed = this.util.embed().setDescription(message.content);

                const row = this.util
                    .row()
                    .setComponents([
                        this.util
                            .button()
                            .setCustomId("accept_rules")
                            .setLabel("Accept Rules")
                            .setStyle("SUCCESS"),
                    ]);

                await channel.send({
                    embeds: [embed],
                    components: [row],
                });

                dbGuild.channels.rules = channel.id;

                await dbGuild.save();

                return interaction.reply({
                    content: `Finished setting up rules in ${channel}`,
                    ephemeral: true,
                });
            }
            case "roles": {
                const dbRole = options.getString("db_role") as string;
                const role = options.getRole("role") as Role;

                if (
                    dbGuild.roles[dbRole as keyof typeof dbGuild.roles] &&
                    dbGuild.roles[dbRole as keyof typeof dbGuild.roles].length >
                        0
                )
                    return interaction.reply({
                        content: `${this.util.capFirstLetter(
                            dbRole
                        )} Role is already setup`,
                        ephemeral: true,
                    });

                dbGuild.roles[dbRole as keyof typeof dbGuild.roles] = role.id;

                await dbGuild.save();

                return interaction.reply({
                    content: `Assigned **${dbRole}** to ${role} in the database`,
                    ephemeral: true,
                });
            }
        }
    }
}
