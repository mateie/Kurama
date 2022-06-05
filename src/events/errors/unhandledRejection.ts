import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";
import { inspect } from "util";

export default class UnhandledRejectionEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "unhandledRejection";
        this.process = true;
    }

    async run(reason: Error, p: Promise<any>) {
        const channel = this.client.botLogs;

        const embed = this.util
            .embed()
            .setTitle("There was an Unhandled Rejection/Catch")
            .setURL("https://nodejs.org/api/process.html#event-unhandledrejection")
            .setColor("RED")
            .addField(
                "Reason",
                `\`\`\`${inspect(reason, { depth: 0 })}\`\`\``.substring(0, 1000)
            )
            .addField(
                "Promise",
                `\`\`\`${inspect(p, { depth: 0 })}\`\`\``.substring(0, 1000)
            );

        channel.send({ embeds: [embed] });
    }
}
