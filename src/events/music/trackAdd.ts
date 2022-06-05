import { Queue, Track } from "discord-player";
import { TextChannel } from "discord.js";
import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";

export default class TrackAddEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "trackAdd";
    }

    async run(queue: Queue, track: Track) {
        if (queue.previousTracks.length < 1) return;

        const embed = this.util
            .embed()
            .setAuthor({ name: track.author })
            .setTitle(track.title)
            .setURL(track.url)
            .setDescription("**Added to the queue**")
            .addFields([
                { name: "Duration", value: track.duration, inline: true },
                { name: "Source", value: track.source, inline: true },
            ])
            .setThumbnail(track.thumbnail)
            .setFooter({ text: `Requested by ${track.requestedBy.tag}` });

        const channel = queue.metadata as TextChannel;

        channel
            .send({ embeds: [embed] })
            .then((msg) => setTimeout(() => msg.delete(), 5000));
    }
}
