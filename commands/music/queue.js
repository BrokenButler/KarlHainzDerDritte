const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

module.exports = {
    name: 'queue',
    aliases: ['q'],
    utilisation: '{prefix}queue [infoLength]',
    voiceChannel: true,

    execute(client, message, args) {
        let queue = player.getQueue(message.guild.id);

        if (!queue) return message.channel.send(`No music currently playing ${message.author}... try again ? ❌`);

        if (!queue.tracks[0]) return message.channel.send(`No music in the queue after the current one ${message.author}... try again ? ❌`);

        const embed = new MessageEmbed();
        const methods = ['', '🔁', '🔂'];

        embed.setColor('RED');
        embed.setThumbnail(message.guild.iconURL({size: 2048, dynamic: true}));
        embed.setAuthor(`Server queue - ${message.guild.name} ${methods[queue.repeatMode]}`, client.user.displayAvatarURL({
            size: 1024,
            dynamic: true
        }));

        let tracks = queue.tracks.map((track, i) => `**${i + 1}** - ${track.title} | ${track.author} (requested by : ${track.requestedBy.tag})`);

        let infoStart = 0;
        let infoLength = 5;
        if (args[0] < queue.tracks.length || args[0] > 1) infoLength = Number(args[0]);
        let songs = queue.tracks.length;
        let nextSongs = songs > infoLength ? `And **${songs - infoLength}** other song(s)...` : `In the playlist **${songs}** song(s)...`;

        embed.setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);

        embed.setTimestamp();
        embed.setFooter('Made by BrokenButler', message.author.avatarURL({dynamic: true}));

        const startButton = new MessageButton()
            .setCustomId('start')
            .setEmoji('⏮')
            .setStyle('SECONDARY')
        const previousButton = new MessageButton()
            .setCustomId('previous')
            .setEmoji('⏪')
            .setStyle('SECONDARY')
        const nextButton = new MessageButton()
            .setCustomId('next')
            .setEmoji('⏩')
            .setStyle('SECONDARY')
        const endButton = new MessageButton()
            .setCustomId('end')
            .setEmoji('⏭')
            .setStyle('SECONDARY')

        if (infoStart <= 0) {
            startButton.setDisabled(true);
            previousButton.setDisabled(true);
        } else {
            startButton.setDisabled(false);
            previousButton.setDisabled(false);
        }
        if (infoStart + infoLength >= songs) {
            nextButton.setDisabled(true);
            endButton.setDisabled(true);
        } else {
            nextButton.setDisabled(false);
            endButton.setDisabled(false);
        }

        let buttons = new MessageActionRow()
            .addComponents(startButton)
            .addComponents(previousButton)
            .addComponents(nextButton)
            .addComponents(endButton)

        function handleButtonInteractions(m) {
            m.awaitMessageComponent({componentType: 'BUTTON', time: 3600000})
                .then(interaction => {
                    //Update Variables
                    queue = player.getQueue(m.guild.id);
                    tracks = queue.tracks.map((track, i) => `**${i + 1}** - ${track.title} | ${track.author} (requested by : ${track.requestedBy.tag})`);
                    songs = queue.tracks.length;

                    switch (interaction.customId) {
                        case 'start':
                            infoStart = 0;
                            nextSongs = songs > infoLength ? `And **${Math.max(songs - infoStart - infoLength, 0)}** other song(s)...` : `In the playlist **${songs}** song(s)...`;
                            embed.setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                        case 'previous':
                            infoStart = Math.max(infoStart - infoLength, 0);
                            nextSongs = songs > infoLength ? `And **${Math.max(songs - infoStart - infoLength, 0)}** other song(s)...` : `In the playlist **${songs}** song(s)...`;
                            embed.setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                        case 'next':
                            infoStart += infoLength;
                            nextSongs = songs > infoLength ? `And **${Math.max(songs - infoStart - infoLength, 0)}** other song(s)...` : `In the playlist **${songs}** song(s)...`;
                            embed.setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                        case 'end':
                            infoStart = songs - infoLength;
                            nextSongs = songs > infoLength ? `And **${Math.max(songs - infoStart - infoLength, 0)}** other song(s)...` : `In the playlist **${songs}** song(s)...`;
                            embed.setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                    }
                    if (infoStart <= 0) {
                        startButton.setDisabled(true);
                        previousButton.setDisabled(true);
                    } else {
                        startButton.setDisabled(false);
                        previousButton.setDisabled(false);
                    }
                    if (infoStart + infoLength >= songs) {
                        nextButton.setDisabled(true);
                        endButton.setDisabled(true);
                    } else {
                        nextButton.setDisabled(false);
                        endButton.setDisabled(false);
                    }
                    buttons = new MessageActionRow().setComponents([startButton, previousButton, nextButton, endButton]);
                    interaction.update({embeds: [embed], components: [buttons]})
                        .then(() => {
                            handleButtonInteractions(m)
                        })
                        .catch(console.error);
                })
                .catch(console.error);
        }

        message.channel.send({embeds: [embed], components: [buttons]})
            .then(m => {
                handleButtonInteractions(m)
            })
            .catch(console.error);

        /*
                collector.on('collect', i => {
                    switch (i.customId) {
                        case 'start':
                            infoStart = 0;
                            i.message.embeds[0].setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                        case 'previous':
                            infoStart -= infoLength;
                            i.message.embeds[0].setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                        case 'next':
                            infoStart += infoLength;
                            i.message.embeds[0].setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                        case 'end':
                            infoStart = songs - infoLength;
                            i.message.embeds[0].setDescription(`Current ${queue.current.title}\n\n${tracks.slice(infoStart, infoStart + infoLength).join('\n')}\n\n${nextSongs}`);
                            break;
                    }
                })*/
    }
};