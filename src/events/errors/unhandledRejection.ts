import Client from "@classes/Client";
import ProcessEvent from "@classes/base/event/ProcessEvent";
import { IEvent } from "@types";
import { inspect } from "util";

export default class UnhandledRejectionEvent
    extends ProcessEvent
    implements IEvent
{
    constructor(client: Client) {
        super(client);

        this.name = "unhandledRejection";
    }

    async run(reason: Error, p: Promise<any>) {
        console.error(reason);
        const channel = this.client.botLogs;

        const embed = this.util
            .embed()
            .setTitle("There was an Unhandled Rejection/Catch")
            .setURL(
                "https://nodejs.org/api/process.html#event-unhandledrejection"
            )
            .setColor("RED")
            .addField(
                "Reason",
                `\`\`\`${inspect(reason, {
                    depth: 0,
                })}\`\`\``.substring(0, 1000)
            )
            .addField(
                "Promise",
                `\`\`\`${inspect(p, {
                    depth: 0,
                })}\`\`\``.substring(0, 1000)
            );

        channel.send({ embeds: [embed] });
    }
}
