const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Returns the ping of the client web socket',
    //options: object[]

    permissionsRequired: [PermissionsBitField.Flags.Administrator],
    //botPermissionsRequired: [],
    
    //deleted: false
    //test-only: false


    callback: (client, interaction) => {
        interaction.reply(`Ping: ${client.ws.ping}ms`)
    }
}