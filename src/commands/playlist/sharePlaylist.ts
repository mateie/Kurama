import { ContextMenuInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Menu from "@classes/base/Menu";
import { IMenu } from "@types";

export default class SharePlaylistMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.name = "Share Playlist";

        this.data.setName(this.name).setType(2);
    }

    async run(interaction: ContextMenuInteraction) {
        return this.client.playlists.shareContext(interaction);
    }
}
