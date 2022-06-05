import { gql } from "apollo-server";

export default gql`
  scalar Guild
  scalar User
  scalar Member

  type Query {
    getGuild(id: String!): Guild
    getGuilds: [Guild]

    getUser(id: String!): User
    getUsers: [User]

    getMember(guildId: String!, memberId: String!): Member
    getMembers(guildId: String!): [Member]
  }
`;
