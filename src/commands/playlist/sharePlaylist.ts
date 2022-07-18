import { ContextMenuCommandInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Menu from "@classes/base/Menu";
import { IMenu } from "@types";

export default class SharePlaylistMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.name = "Share Playlist";

        this.data.setName(this.name).setType(2);
    }

    async run(interaction: ContextMenuCommandInteraction) {
        const member = interaction.member as GuildMember;
        return this.client.playlists.shareContext(interaction, member);
    }
}
