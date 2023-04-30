const { testServer } = require('../../../config.json');
const { permissionsRequired } = require('../../commands/Misc/ping');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()){
        return;
    }

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.command.name
        );

        if (!commandObject){
            return;
        }

        if (commandObject.testOnly){
            if (!(interaction.guild.id === testServer)){
                interaction.reply({
                    content: 'Test function currently unavailable',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.permissionsRequired?.length){
            for (const permission of commandObject.permissionsRequired){
                if (!interaction.member.permissions.has(permission)){
                    interaction.reply({
                        content: 'Not enough permissions',
                        ephemeral: true,
                    });
                }
                break;
            }
        }

        if (commandObject.botPermissionsRequired?.length){
            for (const permission of commandObject.botPermissionsRequired){
                const bot = interaction.guild.members.me;

                if (!bot.permissions.has(permission)){
                    interaction.reply({
                        content: 'I don\'t have enough permissions',
                        ephemeral: true,
                    });
                }
                break;
            }
        }

        await commandObject.callback(client, interaction);

    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
};