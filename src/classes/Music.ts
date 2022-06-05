import Client from "./Client";
import { Player } from "discord-player";
import songlyrics from "songlyrics";
import { Message } from "discord.js";

export default class Music extends Player {
    readonly client: Client;

    constructor(client: Client) {
        super(client);

        this.client = client;
    }

    async searchLyrics(title: string) {
        try {
            const search = await songlyrics(title);
            return search;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async buttons(message: Message) {
        const topRow = this.client.util
            .row()
            .addComponents([
                this.client.util
                    .button()
                    .setCustomId("show_queue")
                    .setLabel("Show Queue")
                    .setStyle("PRIMARY"),
                this.client.util
                    .button()
                    .setCustomId("show_track_progress")
                    .setLabel("Show Track Progress")
                    .setStyle("PRIMARY"),
                this.client.util
                    .button()
                    .setCustomId("show_track_lyrics")
                    .setLabel("Show Lyrics")
                    .setStyle("PRIMARY"),
            ]);

        const midRow = this.client.util
            .row()
            .addComponents([
                this.client.util
                    .button()
                    .setCustomId("pause_track")
                    .setLabel("Pause Track")
                    .setStyle("DANGER"),
                this.client.util
                    .button()
                    .setCustomId("skip_current_track")
                    .setLabel("Skip Current Track")
                    .setStyle("DANGER"),
                this.client.util
                    .button()
                    .setCustomId("skip_to_track")
                    .setLabel("Skip to Track")
                    .setStyle("SUCCESS"),
            ]);

        const bottomRow = this.client.util
            .row()
            .addComponents([
                this.client.util
                    .button()
                    .setCustomId("add_tracks")
                    .setLabel("Add Track(s)")
                    .setStyle("SUCCESS"),
            ]);

        await message.edit({ components: [topRow, midRow, bottomRow] });
    }
}
