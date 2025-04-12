import { GuildMember, StageChannel, VoiceChannel } from 'discord.js';
import { wait } from './wait';

export async function legacyAlarmCommand(memberTo : GuildMember, targetChannel : VoiceChannel | StageChannel, initialChannel : VoiceChannel | StageChannel, trueInitialChannel: VoiceChannel) {
  try {
    do {
      await memberTo.voice.setChannel(targetChannel);
      await wait(600);
      await memberTo.voice.setChannel(initialChannel);
      await wait(600);
    } while (memberTo.voice.selfDeaf || memberTo.voice.serverDeaf);
    await memberTo.voice.setChannel(trueInitialChannel);
  } catch (error) {}
}