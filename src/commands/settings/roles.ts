import { CommandInteraction, Guild, Role } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class RolesCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "roles";
        this.description = "Assign roles to the database";

        this.permission = "MANAGE_GUILD";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("db_role")
                    .setDescription("Role in the database")
                    .addChoices(
                        { name: "Member", value: "member" },
                        { name: "Just Joined", value: "joined" }
                    )
                    .setRequired(true)
            )
            .addRoleOption((option) =>
                option
                    .setName("role")
                    .setDescription("Role to assign it to")
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        const dbRole = options.getString("db_role", true);
        const role = options.getRole("role", true) as Role;

        console.log(dbRole as keyof typeof dbGuild.roles);

        dbGuild.roles[dbRole as keyof typeof dbGuild.roles] = role.id;

        await dbGuild.save();

        return interaction.reply({
            content: `${role} was set to **${dbRole}** in the database`,
            ephemeral: true,
        });
    }
}
