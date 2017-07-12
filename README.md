# GreatHerald
The **Great Herald** bot got created specifically with the purpose to serve the community of /r/viktormains Discord Server. His job involves simple talk, role management, promoting streamers and providing data accessible via Riot's API, requested by guild members.

Majority of commands can be invoked with the exclamation mark preceeding them - for example ``!help``. There are also several other bot interactions which do not require the ``!`` syntax, for example ``Dear Viktor <text>`` which triggers the yes/no type of response, or specific keywords occuring in the string which trigger the response frm the bot, be it a text message, be it a reaction.

## Tools of choice
- [Discord.JS](https://discord.js.org) framework,
- [Node.js](https://nodejs.org/en/).

# Command list

To access the list of commands, write ``!h`` or ``!help`` or  ``!commands``.

## Standard commands

```!beep | !build | !choose <x|y> | !clubs | !dun | !faq | !gibeskin | !iam | !iamnot | !impersonate | !joke | !opgg | !pbe | !matchup | !meow/!woof | !rito | !roles | !setstatus | !test | !version```

Reference to the class containing all the commands: [[click](https://github.com/Arcyvilk/GreatHerald/blob/master/classes/commands.js)].

# !beep | !gibeskin | !joke | !rito 

Usage: _everyone_
Purpose: _returning /r/viktormains community memes._

# !build | !clubs | !faq | !matchup <champion>

Usage: _everyone_
Purpose: _returns /r/viktormains community recommendations on the particular topic._

# !choose <x|y> 

Usage: _everyone_
Purpose: _make the bot choose for you from the given options._

# !dun 

Usage: _everyone_
Purpose: _returns information on the Dun, challenger Viktor main._

# !iam / !iamnot 

Usage: _everyone_
Purpose: _server role management commands._
To access the full list of self-assignable roles, use the ``!roles`` command.

# !impersonate 

Usage: _Moderators_
Purpose: _makes bot resend the given string into the #offtopic room._

# !opgg <ign|server> 

Usage: _everyone_
Purpose: _returns the link to OP.gg of the particular playe.r_

# !pbe 

Usage: _everyone_
Purpose: _returns the link to the newest PBE patch using the http://surrenderat20.net website._

# !meow/!woof 

Usage: _everyone_
Purpose: _returns a cat or a dog photo, using the http://random.cat and http://random.dog API's._

# !setstatus 

Usage: _Moderators_
Purpose: _changes the "Playing" status of the bot._

# !test 

Usage: _Moderators_
Purpose: _testing command._

# !version

Usage: _everyone_
Purpose: _returns the version of the bot._

## Commands using Riot's API

```!giveid | !ingame | !lastgame | !mastery | !masterrace/!diamondrace/!platinumrace/!goldrace/!silverrace | !stats```

## Legal information
_Great Herald_ bot isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
