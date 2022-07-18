import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { inspect } from "util";

export default class DiscordErrorEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "error";
    }

    async run(err: Error) {
        console.error(err);
        const channel = this.client.botLogs;
        if (!channel) return;

        const embed = this.util
            .embed()
            .setTitle("Error")
            .setURL(
                "https://discordjs.guide/popular-topics/errors.html#api-errors"
            )
            .setColor("Red")
            .setDescription(`\`\`\`${inspect(err, { depth: 0 })}\`\`\``);

        channel.send({ embeds: [embed] });
    }
}
