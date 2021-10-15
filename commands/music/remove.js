module.exports = {
    name: 'remove',
    aliases: ['rm'],
    utilisation: '{prefix}remove [pos]',
    voiceChannel: true,

    async execute(client, message, [pos]) {
        const queue = player.getQueue(message.guild.id);

        if (!queue || !queue.playing) return message.channel.send(`No music currently playing ${message.author}... try again ? ❌`);

        if (!queue.tracks[0]) return message.channel.send(`No music in the queue after the current one ${message.author}... try again ? ❌`);

        if (!pos) pos = queue.tracks.length;

        if (pos > queue.tracks.length || pos < 1) return message.channel.send("That is not a valid track!... try again ? ❌");
        let song = queue.tracks[Number(pos) - 1];
        queue.tracks.splice(Number(pos) - 1, 1);

        message.channel.send(`Removed song from queue: \`${song.title}\` 🗑️`)
            .then(msg => {
                setTimeout(() => {
                    msg.delete();
                    message.delete();
                }, 20000)
            });
    }
};