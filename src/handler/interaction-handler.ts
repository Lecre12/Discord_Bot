
import { getVoiceConnection } from "@discordjs/voice";
import { buildConfigPanel } from "../command/config-panel";
import { toggleDebugLogs } from "../util/debug-log";
import { setAudioPlayer, setConnection } from "../util/server-data";
import { getVoiceStatusLines } from "../util/voice-status";

export function handleInteraction(interaction: any){
    if(interaction.isButton()){
        if(interaction.customId === 'config_toggle_debug'){
            toggleDebugLogs();
            interaction.update(buildConfigPanel(interaction, false));
            return;
        }

        if(interaction.customId === 'config_status_voice'){
            interaction.reply({
                content: getVoiceStatusLines(interaction.guild).join('\n'),
                ephemeral: true,
            });
            return;
        }

        if(interaction.customId === 'config_disconnect'){
            const guildId = interaction.guildId as string;
            const connection = getVoiceConnection(guildId);
            setAudioPlayer(undefined, guildId);
            setConnection(undefined, guildId);
            connection?.destroy();
            interaction.update(buildConfigPanel(interaction, false));
            return;
        }
    }

    if(interaction.isStringSelectMenu()){
        if(interaction.customId === 'language_select'){
            
            interaction.deferUpdate()
        }else if(interaction.customId === 'checkBox_connect'){
            
            interaction.deferUpdate()
        }
    }
}
