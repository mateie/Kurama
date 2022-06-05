import { ContextMenuInteraction, Guild } from "discord.js";
import Client from "@classes/Client";
import Menu from "@classes/base/Menu";
import { IMenu } from "@types";

export default class WarnMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.name = "Warn Member";
        this.permission = "MODERATE_MEMBERS";

        this.data.setName(this.name).setType(2);
    }

    async run(interaction: ContextMenuInteraction) {
        const guild = interaction.guild as Guild;
        const member = await guild.members.fetch(interaction.targetId);

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true,
            });

        return interaction.showModal(this.client.moderation.warns.modal(member));
    }
}
