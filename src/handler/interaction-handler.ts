
export function handleInteraction(interaction: any){
    if(interaction.isStringSelectMenu()){
        if(interaction.customId === 'language_select'){
            
            interaction.deferUpdate()
        }else if(interaction.customId === 'checkBox_connect'){
            
            interaction.deferUpdate()
        }
    }
}
