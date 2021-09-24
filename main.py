import json

from discord.ext import commands

from musicCog import MusicCog

bot = commands.Bot(command_prefix='-')
bot.add_cog(MusicCog(bot))

with open('token.json', 'r') as file:
    data = json.load(file)


@bot.event
async def on_ready():
    print(f'Ready to rumble sir!\n{bot.user.name}')


if __name__ == '__main__':
    bot.run(data['token'])
