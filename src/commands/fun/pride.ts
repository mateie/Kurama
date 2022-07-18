import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class PrideCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "pride";
        this.description = "Pride :)";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addAttachmentOption((option) =>
                option
                    .setName("image")
                    .setDescription("Image to use")
                    .setRequired(false)
            );
    }

    async run(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;

        const image = options.getAttachment("image")
            ? options.getAttachment("image", true).url
            : member.displayAvatarURL();

        const pride = await new this.util.dig.Gay().getImage(image);

        const attachment = this.util.attachment(pride);

        return interaction.reply({ files: [attachment], ephemeral: true });
    }
}
