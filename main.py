import discord
from discord.ext import commands
import json

from musicCog import MusicCog

bot = commands.Bot(command_prefix='-')
bot.add_cog(MusicCog(bot))
with open('config.json', 'r') as file:
    data = json.load(file)

if __name__ == '__main__':
    bot.run(data['token'])
