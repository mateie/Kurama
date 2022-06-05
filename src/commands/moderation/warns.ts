import { CommandInteraction, Guild, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class WarnsCommand extends Command implements ICommand {
  constructor(client: Client) {
    super(client);

    this.name = "warns";
    this.description = "Check warns of a member";
    this.permission = "VIEW_AUDIT_LOG";

    this.data
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("Member to check warns of")
          .setRequired(true)
      );
  }

  async run(interaction: CommandInteraction) {
    const { options } = interaction;

    const member = options.getMember("member") as GuildMember;

    if (member.user.bot)
      return interaction.reply({
        content: `${member} is a bot`,
        ephemeral: true,
      });

    const guild = interaction.guild as Guild;

    const warns = await this.client.moderation.warns.get(member);

    if (warns.length < 1)
      return interaction.reply({
        content: `${member} has no warns`,
        ephemeral: true,
      });

    const warnMap = warns.map(
      (warn) => `
            **Warned by**: ${guild.members.cache.get(warn.by)}
            **Reason**: ${warn.reason}
        `
    );

    return this.util.pagination.default(
      interaction,
      warnMap,
      `${member.user.tag}'s Warns`
    );
  }
}
