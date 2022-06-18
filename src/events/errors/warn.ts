import Client from "@classes/Client";
import ProcessEvent from "@classes/base/event/ProcessEvent";
import { IEvent } from "@types";
import { inspect } from "util";

export default class WarnEvent extends ProcessEvent implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "warn";
    }

    async run(warn: Error) {
        console.error(warn);
        const channel = this.client.botLogs;

        const embed = this.util
            .embed()
            .setTitle("There was an Uncaught Exception Monitor Warning")
            .setColor("RED")
            .setURL("https://nodejs.org/api/process.html#event-warning")
            .addField(
                "Warn",
                `\`\`\`${inspect(warn, {
                    depth: 0,
                })}\`\`\``.substring(0, 1000)
            );

        channel.send({ embeds: [embed] });
    }
}
