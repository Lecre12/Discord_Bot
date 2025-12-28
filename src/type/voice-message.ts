
import { Guild, GuildMember, User } from "discord.js";
export interface VoiceMessage {
  content?: string;
  author: User;
  guild: Guild;
  member: GuildMember;
}