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
        if (!channel) return;

        const embed = this.util
            .embed()
            .setTitle("There was an Uncaught Exception Monitor Warning")
            .setColor("Red")
            .setURL("https://nodejs.org/api/process.html#event-warning")
            .addFields({
                name: "Warn",
                value: `\`\`\`${inspect(warn, {
                    depth: 0
                })}\`\`\``.substring(0, 1000)
            });

        channel.send({ embeds: [embed] });
    }
}
