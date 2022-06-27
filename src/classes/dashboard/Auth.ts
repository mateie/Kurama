import Client from "@classes/Client";
import DashboardBE from ".";

import { Guild, Permissions, User } from "discord.js";

import jwt from "jsonwebtoken";
import { ExpressContext } from "apollo-server-express";
import { AuthenticationError } from "apollo-server-express";
import DiscordOAuth2 from "discord-oauth2";

const { JWT_SECRET, SECRET } = process.env;

export default class Auth {
    readonly client: Client;
    readonly server: DashboardBE;

    private readonly jwt: any;
    private readonly oauth: DiscordOAuth2;
    private readonly secrets: { client: string; jwt: string };

    constructor(client: Client) {
        this.client = client;
        this.server = client.dashboard;

        this.jwt = jwt;
        this.oauth = new DiscordOAuth2();
        this.secrets = { client: SECRET as string, jwt: JWT_SECRET as string };
    }

    async getUserGuilds(auth: any) {
        if (!auth) throw new AuthenticationError("User not logged in");

        const decoded = this.jwt.verify(
            this.client.crypt.decrypt(auth),
            this.secrets.jwt
        );

        const guilds = (
            await this.oauth.getUserGuilds(decoded.token.access_token)
        )
            .filter((guild) => {
                const perms = new Permissions(guild.permissions as any);
                return perms.has("MANAGE_GUILD");
            })
            .map((guild) => {
                const iconURL = guild.icon
                    ? this.client.util.cdn.icon(guild.id, guild.icon)
                    : "https://imgur.com/SCv8M69";

                const botJoined = this.client.guilds.cache.get(guild.id)
                    ? true
                    : false;

                if (botJoined) {
                    const guildJSON = this.client.guilds.cache
                        .get(guild.id)
                        ?.toJSON();

                    return {
                        ...guild,
                        ...(guildJSON as Guild),
                        botJoined,
                        iconURL,
                    };
                }

                return {
                    ...guild,
                    botJoined,
                    iconURL,
                };
            });

        return guilds;
    }

    check(context: ExpressContext) {
        const header = context.req.headers.authorization;
        if (!header) throw new Error("You must be logged in");
        const token = header.split("Bearer ")[1];
        if (!token)
            throw new Error("Authentication token must be 'Bearer [token]'");
        try {
            const user = jwt.verify(token, this.secrets.jwt);
            return user;
        } catch (err) {
            throw new AuthenticationError(
                "Session timed out, please refresh the page and login again"
            );
        }
    }

    async generateToken(code: any) {
        try {
            const token = await this.oauth.tokenRequest({
                clientId: this.client.user?.id,
                clientSecret: this.secrets.client,

                code: Buffer.from(code, "base64").toString("ascii"),
                scope: "identify guilds",
                grantType: "authorization_code",
                redirectUri: "http://73.185.96.104:3000/login",
            });

            return this.client.crypt.encrypt(
                this.jwt.sign(
                    {
                        token,
                    },
                    this.secrets.jwt
                )
            );
        } catch (err) {
            console.error(err);
            throw new AuthenticationError(
                "Authentication failed, please try again"
            );
        }
    }

    async authUser(auth: any) {
        if (!auth)
            throw new AuthenticationError("Authentication data not provided");
        try {
            const decoded = this.jwt.verify(
                this.client.crypt.decrypt(auth),
                this.secrets.jwt
            );
            const user = await this.oauth.getUser(decoded.token.access_token);

            const avatarURL = user.avatar
                ? this.client.util.cdn.avatar(user.id, user.avatar)
                : this.client.util.cdn.defaultAvatar(0);

            if (this.client.users.cache.get(user.id)) {
                const db = await this.client.database.users.get(
                    this.client.users.cache.get(user.id) as User
                );
                return {
                    ...user,
                    ...db._doc,
                    database: true,
                    avatarURL,
                };
            }

            return {
                ...user,
                avatarURL,
                database: false,
            };
        } catch (err) {
            console.error(err);
            throw new AuthenticationError(
                "Authentication failed, please try again"
            );
        }
    }
}
