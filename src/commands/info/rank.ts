import { CommandInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class RankCommand extends Command implements ICommand {
  constructor(client: Client) {
    super(client);

    this.name = "rank";
    this.description = "Look at your or someone's rank";

    this.data
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("Who's rank do you want to view")
          .setRequired(false)
      );
  }

  async run(interaction: CommandInteraction) {
    const { options } = interaction;

    const member = options.getMember("member")
      ? (options.getMember("member") as GuildMember)
      : (interaction.member as GuildMember);

    if (member.user.bot)
      return interaction.reply({
        content: `${member} is a bot`,
        ephemeral: true,
      });

    const attachment = await this.client.canvas.member.rank(member);

    return interaction.reply({ files: [attachment] });
  }
}
