import { CommandInteraction } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class EightBallCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "8ball";
        this.description = "8 Ball be like";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("question")
                    .setDescription("Quesiton for the 8 Ball")
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        let question = interaction.options.getString("question") as string;

        if (!question.includes("!")) question += "?";

        if (
            question.includes("<") &&
            question.includes("@") &&
            question.includes(">")
        ) {
            const withAt = question
                .replace("<@!", "")
                .replace(">", "")
                .split(" ")
                .map((word) =>
                    parseInt(word)
                        ? this.client.users.cache.get(word)
                            ? this.client.users.cache.get(word)?.username
                            : null
                        : word
                )
                .join(" ");
            question = withAt;
        }

        const { url } = await this.client.nekos.eightBall({
            text: question,
        });

        const embed = this.util
            .embed()
            .setTitle(question)
            .setImage(url as string);

        return interaction.reply({ embeds: [embed] });
    }
}
