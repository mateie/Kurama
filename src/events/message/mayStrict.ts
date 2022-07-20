import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { Message, TextChannel } from "discord.js";

export default class MayStrictEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "messageCreate";
    }

    async run(message: Message) {
        if (message.guild?.id !== "848040514750382092") return;
        if (message.member?.id !== "692811491686088777") return;

        const mayChannel = message.guild.channels.cache.get(
            "994705595846365334"
        ) as TextChannel;

        if (
            message.channel.id === mayChannel.id ||
            message.channel.id === "994387098696159313"
        )
            return;

        const reply = await message.reply({
            content: `Please type in ${mayChannel}`
        });

        await message.delete();
        setTimeout(() => {
            reply.delete();
        }, 3000);
    }
}
