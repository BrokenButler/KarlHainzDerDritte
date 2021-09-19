import discord
from discord.ext import commands

from musicCog import MusicCog

bot = commands.Bot(command_prefix='-')
bot.add_cog(MusicCog(bot))

if __name__ == '__main__':
    bot.run('ODg4OTEzODczODg3OTY1MjQ0.YUZnjg.zyb-LUY0Y3omldNT6a6kBDon9so')
