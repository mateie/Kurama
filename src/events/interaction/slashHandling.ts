import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IBase, ICommand, IEvent, IMenu } from "@types";
import {
    CommandInteraction,
    Guild,
    GuildMember,
    TextChannel,
} from "discord.js";
import { channelMention } from "@discordjs/builders";

export default class SlashHandlingEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "interactionCreate";
        this.description = "Handles Slash Commands";
    }

    async run(interaction: CommandInteraction) {
        const { commandName } = interaction;

        const guild = interaction.guild as Guild;
        const channel = interaction.channel as TextChannel;
        const member = interaction.member as GuildMember;

        const dbGuild = await this.client.database.guilds.get(guild);

        if (interaction.isApplicationCommand()) {
            if (guild.ownerId !== member.id) {
                const category =
          this.client.commandHandler.commands.get(commandName)?.category;
                if (
                    category?.toString().toLowerCase() === "music" &&
          dbGuild.toggles.strictMusicChannels
                ) {
                    const musicChannels = dbGuild.channelsArray.music;
                    const channelMentions = musicChannels
                        .map((id) => channelMention(id))
                        .join(", ");

                    if (musicChannels.length < 1)
                        return interaction.reply({
                            content:
                "Strict Music Channel is enabled but there are no channels added to it's list",
                            ephemeral: true,
                        });
                    if (!musicChannels.includes(channel.id))
                        return interaction.reply({
                            content: `You cannot use music commands in this channel. Use them here: ${channelMentions}`,
                            ephemeral: true,
                        });
                } else if (
                    dbGuild.toggles.strictCommands &&
          category?.toString().toLowerCase() !== "settings"
                ) {
                    const commandChannels = dbGuild.channelsArray.commands;
                    const channelMentions = commandChannels
                        .map((id) => channelMention(id))
                        .join(", ");

                    if (commandChannels.length < 1)
                        return interaction.reply({
                            content:
                "Strict Commands is enabled but there are no channels added to it's list",
                            ephemeral: true,
                        });
                    if (!commandChannels.includes(channel.id))
                        return interaction.reply({
                            content: `You cannot use commands in this channel, Use them here: ${channelMentions}`,
                            ephemeral: true,
                        });
                }
            }

            const base = this.client.commandHandler.commands.get(
                commandName
            ) as IBase;
            if (base.ownerOnly && !this.client.owners.includes(member.id))
                return interaction.reply({
                    content: "This command is owner only",
                    ephemeral: true,
                });
            if (base.permission && !member.permissions.has(base.permission))
                return interaction.reply({
                    content: "Not enough permissions",
                    ephemeral: true,
                });

            if (interaction.isCommand()) {
                const command = base as ICommand;

                try {
                    command.run(interaction);
                } catch (err) {
                    console.error(err);
                    return interaction.reply({
                        content: "An error occured, please try again",
                        ephemeral: true,
                    });
                }
            }

            if (interaction.isContextMenu()) {
                const menu = base as IMenu;

                try {
                    menu.run(interaction);
                } catch (err) {
                    console.error(err);
                    return interaction.reply({
                        content: "An error occured, please try again",
                        ephemeral: true,
                    });
                }
            }
        }
    }
}
