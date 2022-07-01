import { CommandInteraction, Guild } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class TogglesCommand extends Command implements ICommand {
    choices: { name: string; value: string }[];

    constructor(client: Client) {
        super(client);

        this.name = "toggle";
        this.description = "Toggle Certain Things";
        this.permission = "MANAGE_GUILD";

        this.choices = [
            { name: "Welcome Message", value: "welcomeMessage" },
            { name: "Goodbye Message", value: "goodbyeMessage" },
            { name: "Just Joined", value: "justJoined" },
            { name: "Strict Commands", value: "strictCommands" },
            {
                name: "Strict Music Channels",
                value: "strictMusicChannels",
            },
        ];

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("rule")
                    .setDescription("Choose a rule")
                    .setChoices(...this.choices)
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        const rule = options.getString("rule");

        const oldValue = dbGuild.toggles[rule as keyof typeof dbGuild.toggles]
            ? "On"
            : "Off";

        const ruleName = this.choices.find(
            (choice) => choice.value === rule
        )?.name;

        dbGuild.toggles[rule as keyof typeof dbGuild.toggles] =
            !dbGuild.toggles[rule as keyof typeof dbGuild.toggles];

        await dbGuild.save();

        return interaction.reply({
            content: `Toggled ***${ruleName}***, Old Value: **${oldValue}** - New Value: **${
                dbGuild.toggles[rule as keyof typeof dbGuild.toggles]
                    ? "On"
                    : "Off"
            }**`,
            ephemeral: true,
        });
    }
}
