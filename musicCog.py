import discord
from discord.ext import commands
from youtube_dlc import YoutubeDL


class MusicCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

        # all the music related stuff
        self.is_playing = False

        # 2d array containing [song, channel]
        self.music_queue = []
        self.YDLC_OPTIONS = {'format': '[height <=? 360p]+bestaudio',
                             'audio-quality': '0',
                             'extract-audio': 'True',
                             'noplaylist': 'True',
                             'geo-bypass': 'True'}
        self.FFMPEG_OPTIONS = {'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
                               'options': '-vn'}

        self.vc = ''

    def search_yt(self, item):
        with YoutubeDL(self.YDLC_OPTIONS) as ydl:
            try:
                info = ydl.extract_info('ytsearch:%s' % item, download=False)['entries'][0]
            except Exception:
                return False

        return {'source': info['formats'][0]['url'], 'title': info['title']}

    def play_next(self):
        if len(self.music_queue) > 0:
            self.is_playing = True

            # get the first url
            m_url = self.music_queue[0][0]['source']

            # remove the first element as you are currently playing it
            self.music_queue.pop(0)

            self.vc.play(discord.FFmpegPCMAudio(m_url, **self.FFMPEG_OPTIONS), after=lambda e: self.play_next())
        else:
            self.is_playing = False

    async def play_music(self):
        if len(self.music_queue) > 0:
            self.is_playing = True

            # get the first url
            m_url = self.music_queue[0][0]['source']

            # try to connect to voice channel if you are not already in one
            if self.vc == '' or not self.vc.is_connected():
                self.vc = await self.music_queue[0][1].connect()

            # remove the first element as you are currently playing it
            self.music_queue.pop(0)

            self.vc.play(discord.FFmpegPCMAudio(m_url, **self.FFMPEG_OPTIONS), after=lambda e: self.play_next())
        else:
            self.is_playing = False

    @commands.command(name='play', aliases=['p', 'search', 'spiel'])
    async def play(self, context, *, query):
        # save voice channel of the user
        voice_channel = context.author.voice.channel

        if voice_channel is None:
            await context.send('You need to be in a voice channel to use that command.')
        else:
            song = self.search_yt(query)
            if type(song) == type(True):  # TODO make this better and cleaner
                await context.send('Could not download the song. Incorrect format.')
            else:
                # await context.message.add_reaction(':+1:')  # TODO test this later
                await context.send('Song added to the queue.')
                self.music_queue.append([song, voice_channel])

                if not self.is_playing:
                    await self.play_music()

    @commands.command(name='queue', aliases=['q', 'schlange'])
    async def queue(self, context):
        retval = ''
        for i in range(0, len(self.music_queue)):
            retval += self.music_queue[i][0]['title'] + '\n'

        print(retval)
        if retval != '':
            await context.send(retval)
        else:
            await context.send('No songs in queue.')

    @commands.command(name='skip', aliases=['s', 'next'])
    async def skip(self, context):
        if self.vc != '':
            if self.vc.is_connected():
                self.vc.stop()
                self.play_next()
