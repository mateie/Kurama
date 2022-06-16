import Client from "@classes/Client";
import DashboardBE from ".";

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
                redirectUri: "http://localhost:3000/callback",
            });

            return this.jwt.sign(
                {
                    token,
                },
                this.secrets.jwt
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
            const user = await this.oauth.getUser(auth.access_token);
            const guilds = await this.oauth.getUserGuilds(auth.access_token);

            return { ...user, guilds };
        } catch (err) {
            console.error(err);
            throw new AuthenticationError(
                "Authentication failed, please try again"
            );
        }
    }
}
