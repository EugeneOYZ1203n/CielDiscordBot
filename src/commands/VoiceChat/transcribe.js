const { joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice');
const { PermissionsBitField } = require('discord.js');
const { OpusEncoder } = require( "@discordjs/opus" ); 

const vosk = require('vosk');
let recs = {}
vosk.setLogLevel(-1);
  // MODELS: https://alphacephei.com/vosk/models
recs = {
    'en': new vosk.Recognizer({model: new vosk.Model('vosk-model-en-us-0.22-lgraph'), sampleRate: 48000}),
}

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

                const speaker = member_channel.members.get(userId).user.username;

                console.log('speaking to' + speaker);

                const audioStream = receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.AfterSilence,
                        duration: 100,
                    },
                });
                
                audioStream.on('error',  (e) => { 
                    console.log('audioStream: ' + e)
                });
                const encoder = new OpusEncoder(48000, 2);
                let buffer = [];
                audioStream.on('data', (data) => {
                    buffer.push(encoder.decode(data));
                })
                audioStream.on('end', async () => {

                    buffer = Buffer.concat(buffer);
                    const duration = buffer.length / 48000 / 4;
                    console.log("duration: " + duration);

                    if (duration < 1.0){
                        console.log("Duration too short, skipping!");
                        return;
                    }

                    try {
                        let new_buffer = await convert_audio(buffer);
                        let out = await transcribe(new_buffer);
                        if (out != null){
                            interaction.channel.send(speaker + ': ' + out);
                        }
                    } catch (e) {
                        console.log('tmpraw rename: ' + e);
                    }


                })
            });
        });
    }
}

async function convert_audio(input) {
    try {
        // stereo to mono channel
        const data = new Int16Array(input);
        const ndata = data.filter((el, idx) => idx % 2);
        return Buffer.from(ndata);
    } catch (e) {
        console.log('convert_audio: ' + e);
        throw e;
    }
}

async function transcribe(buffer) {
    recs['en'].acceptWaveform(buffer);
    let ret = recs['en'].result().text;
    console.log('vosk:', ret);
    return ret;
}