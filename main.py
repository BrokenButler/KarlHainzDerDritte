import discord
from discord.ext import commands
import json

from musicCog import MusicCog

bot = commands.Bot(command_prefix='-')
bot.add_cog(MusicCog(bot))
with open('config.json', 'r') as file:
    data = json.load(file)


@bot.event
async def on_ready():
    print('Anwesend {}'.format(bot.user.name))


if __name__ == '__main__':
    bot.run(data['token'])
