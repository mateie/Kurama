import { Queue, Track } from "discord-player";
import { TextChannel } from "discord.js";
import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";

export default class TrackStartEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "trackStart";
    }

    async run(queue: Queue, track: Track) {
        const embed = this.util
            .embed()
            .setAuthor({ name: track.author })
            .setTitle(track.title)
            .setURL(track.url)
            .setDescription("**Started Playing**")
            .addFields([
                {
                    name: "Duration",
                    value: track.duration,
                    inline: true,
                },
                {
                    name: "Source",
                    value: track.source,
                    inline: true,
                },
            ])
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Requested by ${track.requestedBy.tag}`,
            });

        const channel = queue.metadata as TextChannel;

        const message = await channel.send({ embeds: [embed] });

        this.client.music.buttons(message);
    }
}
