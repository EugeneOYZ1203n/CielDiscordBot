const { joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice');
const { PermissionsBitField } = require('discord.js');
const { createWriteStream } = require('node-fs');
const { pipeline } = require('node-stream');

module.exports = {
    name: 'transcribe',
    description: 'Transcribes the audio of the channel it is in',
    //options: object[]

    permissionsRequired: [PermissionsBitField.Flags.Administrator],
    //botPermissionsRequired: [],
    
    //deleted: false
    //test-only: false


    callback: async (client, interaction) => {
        var member_channel = interaction.member.voice.channel;

        if (!member_channel){
            interaction.reply(`You are not in a channel. Please join one first`);
            return;
        }

        const connection = joinVoiceChannel({
            channelId: member_channel.id,
            guildId: member_channel.guild.id,
            adapterCreator: member_channel.guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('The connection has entered the Ready state');
            
            const receiver = connection.receiver;

            receiver.speaking.on('start', (userId) => {
                console.log('speaking');
            });
        });
    }
}
