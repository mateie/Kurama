import { CommandInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class JailCommand extends Command implements ICommand {
constructor(client: Client) {
super(client);

this.name = "jail";
this.description = "Put someone in jail";

this.data
.setName(this.name)
    .setDescription(this.description)
    .addAttachmentOption(option =>
        option
            .setName("image")
            .setDescription("Image to use")
        .setRequired(false)
        );
}

async run(interaction: CommandInteraction) {
    const { options } = interaction;

    const member = interaction.member as GuildMember;

    const image = options.getAttachment("image") ? options.getAttachment("image", true).url : member.displayAvatarURL({ format: "png" });

    const jail = await new this.util.dig.Jail().getImage(image);

    const attachment = this.util.attachment(jail);

    return interaction.reply({ files: [attachment], ephemeral: true });
}
}