import { ChannelType, ChatInputCommandInteraction, Guild } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class ServerInfoCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "server";
        this.description = "Server Info";

        this.data.setName(this.name).setDescription(this.description);
    }

    async run(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild as Guild;
        const {
            createdTimestamp,
            description,
            members,
            memberCount,
            channels,
            emojis,
            stickers
        } = guild;

        const icon = guild.iconURL() as string;

        const embed = this.util
            .embed()
            .setAuthor({ name: guild.name, iconURL: icon })
            .setThumbnail(icon)
            .addFields([
                {
                    name: "General",
                    value: `
                            Name: ${guild.name}
                            Created: <t:${Math.floor(
                                createdTimestamp / 1000
                            )}:R>
                            Owner: ${guild.members.cache.get(guild.ownerId)}

                            Description: ${description}
                        `
                },
                {
                    name: "👥| Users",
                    value: `
                            - Members: ${
                                members.cache.filter((m) => !m.user.bot).size
                            }
                            - Bots: ${
                                members.cache.filter((m) => m.user.bot).size
                            }
                        
                            Total: ${memberCount}
                        `
                },
                {
                    name: "📃 | Channels",
                    value: `
                            - Text: ${
                                channels.cache.filter(
                                    (ch) => ch.type == ChannelType.GuildText
                                ).size
                            }
                            - Voice: ${
                                channels.cache.filter(
                                    (ch) => ch.type == ChannelType.GuildVoice
                                ).size
                            }
                            - Threads: ${
                                channels.cache.filter(
                                    (ch) =>
                                        ch.type ==
                                            ChannelType.GuildPublicThread ||
                                        ch.type ==
                                            ChannelType.GuildPrivateThread ||
                                        ch.type == ChannelType.GuildNewsThread
                                ).size
                            }
                            - Categories: ${
                                channels.cache.filter(
                                    (ch) => ch.type == ChannelType.GuildCategory
                                ).size
                            }
                            - Stages: ${
                                channels.cache.filter(
                                    (ch) =>
                                        ch.type == ChannelType.GuildStageVoice
                                ).size
                            }
                            - News: ${
                                channels.cache.filter(
                                    (ch) => ch.type == ChannelType.GuildNews
                                ).size
                            }

                            Total: ${channels.cache.size}
                        `
                },
                {
                    name: "😯 | Emojis & Stickers",
                    value: `
                            - Animated: ${
                                emojis.cache.filter((e) => e.animated == true)
                                    .size
                            }
                            - Static: ${
                                emojis.cache.filter((e) => !e.animated).size
                            }
                            - Stickers: ${stickers.cache.size}

                            Total: ${emojis.cache.size + stickers.cache.size}
                        `
                },
                {
                    name: "Nitro Statistics",
                    value: `
                            - Tier: ${guild.premiumTier}
                            - Boosts: ${guild.premiumSubscriptionCount}
                            - Boosters: ${
                                members.cache.filter(
                                    (m) => m.premiumSince !== null
                                ).size
                            }
                        `
                }
            ]);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
