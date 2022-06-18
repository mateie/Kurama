import Client from "@classes/Client";
import ProcessEvent from "@classes/base/event/ProcessEvent";
import { IEvent } from "@types";
import { inspect } from "util";

export default class ProcessErrorEvent extends ProcessEvent implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "error";
    }

    async run(err: Error) {
        console.error(err);
        const channel = this.client.botLogs;

        const embed = this.util
            .embed()
            .setTitle("Error")
            .setURL(
                "https://discordjs.guide/popular-topics/errors.html#api-errors"
            )
            .setColor("RED")
            .setDescription(`\`\`\`${inspect(err, { depth: 0 })}\`\`\``);

        channel.send({ embeds: [embed] });
    }
}
