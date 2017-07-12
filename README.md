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

### !beep | !gibeskin | !joke | !rito 

**Usage**: _everyone_  
**Purpose**: returning /r/viktormains community memes.

### !build | !clubs | !faq | !matchup <champion>

**Usage**: _everyone_  
**Purpose**: returns /r/viktormains community recommendations on the particular topic.

### !choose <x|y> 

**Usage**: _everyone_  
**Purpose**: make the bot choose for you from the given options.

### !dun 

**Usage**: _everyone_  
**Purpose**: returns information on the Dun, challenger Viktor main.

### !iam / !iamnot 

**Usage**: _everyone_  
**Purpose**: server role management commands.

****To access the full list of self-assignable roles, use the ``!roles`` command.**

### !impersonate 

**Usage**: _Moderators_  
**Purpose**: makes bot resend the given string into the #offtopic room.

### !opgg <ign|server> 

**Usage**: _everyone_  
**Purpose**: returns the link to OP.gg of the particular player.

### !pbe 

**Usage**: _everyone_  
**Purpose**: returns the link to the newest PBE patch using the http://surrenderat20.net website.

### !meow/!woof 

**Usage**: _everyone_  
**Purpose**: returns a cat or a dog photo, using the http://random.cat and http://random.dog API's.

### !setstatus 

**Usage**: _Moderators_  
**Purpose**: changes the "Playing" status of the bot.

### !test 

**Usage**: _Moderators_  
**Purpose**: testing command.

### !version

**Usage**: _everyone_  
**Purpose**: returns the version of the bot.

## Commands using Riot's API

```!giveid | !ingame | !lastgame | !mastery | !masterrace/!diamondrace/!platinumrace/!goldrace/!silverrace | !stats```

## Legal information
_Great Herald_ bot isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
