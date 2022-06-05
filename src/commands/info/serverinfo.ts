import { CommandInteraction, Guild } from "discord.js";
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

  async run(interaction: CommandInteraction) {
    const guild = interaction.guild as Guild;
    const {
      createdTimestamp,
      description,
      members,
      memberCount,
      channels,
      emojis,
      stickers,
    } = guild;

    const icon = guild.iconURL({ dynamic: true }) as string;

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
                        `,
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
                        `,
        },
        {
          name: "📃 | Channels",
          value: `
                            - Text: ${
                              channels.cache.filter(
                                (ch) => ch.type == "GUILD_TEXT"
                              ).size
                            }
                            - Voice: ${
                              channels.cache.filter(
                                (ch) => ch.type == "GUILD_VOICE"
                              ).size
                            }
                            - Threads: ${
                              channels.cache.filter((ch) =>
                                ch.type.includes("THREAD")
                              ).size
                            }
                            - Categories: ${
                              channels.cache.filter(
                                (ch) => ch.type == "GUILD_CATEGORY"
                              ).size
                            }
                            - Stages: ${
                              channels.cache.filter(
                                (ch) => ch.type == "GUILD_STAGE_VOICE"
                              ).size
                            }
                            - News: ${
                              channels.cache.filter(
                                (ch) => ch.type == "GUILD_NEWS"
                              ).size
                            }

                            Total: ${channels.cache.size}
                        `,
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
                        `,
        },
        {
          name: "Nitro Statistics",
          value: `
                            - Tier: ${guild.premiumTier.replace("TIER_", "")}
                            - Boosts: ${guild.premiumSubscriptionCount}
                            - Boosters: ${
                              members.cache.filter(
                                (m) => m.premiumSince !== null
                              ).size
                            }
                        `,
        },
      ]);

    return interaction.reply({ embeds: [embed] });
  }
}
