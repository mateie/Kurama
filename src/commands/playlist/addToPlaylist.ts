import {
    ContextMenuCommandInteraction,
    Message,
    GuildMember
} from "discord.js";
import Client from "@classes/Client";
import Menu from "@classes/base/Menu";
import { IMenu } from "@types";

export default class AddToPlaylistMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.name = "Add to my playlist";

        this.data.setName(this.name).setType(3);
    }

    async run(interaction: ContextMenuCommandInteraction) {
        const { targetId, channel } = interaction;

        const member = interaction.member as GuildMember;
        const message = (await channel?.messages.fetch(targetId)) as Message;

        if (message.content.length < 1)
            return interaction.reply({
                content: "Track not provided",
                ephemeral: true
            });

        return this.client.playlists.add(interaction, member, message);
    }
}
