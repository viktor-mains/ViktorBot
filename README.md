# GreatHerald
The **Great Herald** bot got created specifically with the purpose to serve the community of /r/viktormains Discord Server. His job involves simple talk, role management, promoting streamers and providing data accessible via Riot's API, requested by guild members.

Majority of commands can be invoked with the exclamation mark preceeding them - for example ``!help``. There are also several other bot interactions which do not require the ``!`` syntax, for example ``Dear Viktor <text>`` which triggers the yes/no type of response, or specific keywords occuring in the string which trigger the response frm the bot, be it a text message, be it a reaction.

## Tools of choice
- [Discord.JS](https://discord.js.org) framework,
- [Node.js](https://nodejs.org/en/).

# Command list

To access the list of commands, write ``!h`` or ``!help`` or  ``!commands``.

## 1. Standard commands

```
!beep
!build
!choose <x|y>
!clubs
!dun
!faq
!gibeskin
!iam / !iamnot
!impersonate
!joke
!opgg
!pbe
!matchup
!meow / !woof
!rito
!roles
!setstatus
!test
!version
```

Reference to the class containing all the commands: [[click](https://github.com/Arcyvilk/GreatHerald/blob/master/classes/commands.js)].

### !beep | !gibeskin | !joke | !rito 

- **Usage**: _everyone_  
- **Purpose**: returning /r/viktormains community memes.

### !build | !clubs | !faq | !matchup <champion>

- **Usage**: _everyone_  
- **Purpose**: returns /r/viktormains community recommendations on the particular topic.

### !choose <x|y> 

- **Usage**: _everyone_  
- **Purpose**: make the bot choose for you from the given options.

### !dun 

- **Usage**: _everyone_  
- **Purpose**: returns information on the Dun, challenger Viktor main.

### !iam / !iamnot 

- **Usage**: _everyone_ (only in a designated Role room)  
- **Purpose**: server role management commands.

**To access the full list of self-assignable roles, use the ``!roles`` command.**

### !impersonate 

- **Usage**: _Moderators_  
- **Purpose**: makes bot resend the given string into the #offtopic room.

### !opgg <ign|server> 

- **Usage**: _everyone_  
- **Purpose**: returns the link to OP.gg of the particular player.

### !pbe 

- **Usage**: _everyone_  
- **Purpose**: returns the link to the newest PBE patch using the http://surrenderat20.net website.

### !meow/!woof 

- **Usage**: _everyone_  
- **Purpose**: returns a cat or a dog photo, using the http://random.cat and http://random.dog API's.

### !setstatus 

- **Usage**: _Moderators_  
- **Purpose**: changes the "Playing" status of the bot.

### !test 

- **Usage**: _Moderators_  
- **Purpose**: testing command.

### !version

- **Usage**: _everyone_  
- **Purpose**: returns the version of the bot.

## 2. Commands using Riot's API

```
Ranked races
!giveid
!ingame
!lastgame
!mastery
!stats
```

### Ranked races

Ranked races got introduced to our Discord as a way to encourage our community members to compete with each other on their way up to the next ranked tier. Whoever wishes to join the race, may ask the Moderator to add their nickname to the database. When the right command is used, they can check how they place on a ladder relatively to their fellow Viktor mains.

- **Commands**: ``!masterrace | !diamondrace | !platinumrace | !goldrace | !silverrace ``
- **Usage**: _everyone_  
- **Endpoints**: 
    - ``LEAGUE-V2.5``
- **Example of use**:

![http://i.imgur.com/rtXbB1U.png](http://i.imgur.com/rtXbB1U.png)

- **Code**: [[click](https://github.com/Arcyvilk/GreatHerald/blob/master/classes/race.js)]
- **To do**:

[] 24-07-17 - change the ``LEAGUE-V2.5`` endpoint to ``LEAGUE-V3`` one.  
[] change the object storing players data to ``.json``  
[] allow users to join the race themselves  
[] check if the user has enough Viktor games to qualify  

### !giveid <ign|server>

This command returns the summoner ID of the requsted summoner. It's usable only by Moderators because its only use was to ease the development process for some fnctionalities which initially required th summoner ID as an argument.

- **Usage**: _Moderators_  
- **Endpoints**: 
    - ``SUMMONER-V3``
- **Example of use**: 

![http://i.imgur.com/x4yQXJr.png](http://i.imgur.com/x4yQXJr.png)

### !ingame <ign|server>

This command returns the data about the game the requested summoner is playing currently. This data contains: **rank** of all participants, their **win ratio**, their **summoner spells**, **nicknames** and the **name of champion** they're playing, plus the **gamemode's** name.

- **Usage**: _everyone_  
- **Endpoints**: 
    - ``SUMMONER-V3``
    - ``SPECTATOR-V3``
    - ``LOL-STATIC-DATA-V3``
    - ``LEAGUE-V2.5`` 
- **Example of use**:

![http://i.imgur.com/U9lmAJ8.png](http://i.imgur.com/U9lmAJ8.png)

- **To do**:

[ ] 24-07-17 - change the ``LEAGUE-V2.5`` endpoint to ``LEAGUE-V3`` one.

### !lastgame <ign|server> 

This command returns the data of the last game (of any map and type) played by the requested summoner. This data contains: **gamemode name**, info on which team **won**, **numbers of objectives** taken by both teams, all players' **summoner spells**, **KDA**, **gold**, **damage done** and **level**, **name of their champion played** and **player's nickname** in caseof ranked games.

- **Usage**: _everyone_  
- **Endpoints**: 
    - ``SUMMONER-V3``
    - ``MATCH-V3``
    - ``STATIC-DATA-V3``
- **Example of use**:

![http://i.imgur.com/mYeRVPK.png](http://i.imgur.com/mYeRVPK.png)

- **To do**:

[ ] show the player's ranks

### !mastery <ign|server> 

This command shows the total Viktor mastery points for the requeste summoner, as well as the level of the mastery and if the chest for Viktor got already unlocked this season. 

- **Usage**: _everyone_  
- **Endpoints**: 
    - ``SUMMONER-V3``
    - ``CHAMPION-MASTERY-V3``
- **Example of use**:

![http://i.imgur.com/5pSHhpG.png](http://i.imgur.com/5pSHhpG.png)

- **To do**:

[ ] ***MAYBE*** add a possibility to show other champions' mastery aswell (meh)

### !stats <ign|server>

This command returns the top 5 most played champions by the requested summoner, sorted by the total amount of ranked games played by said champions.

**This command is going to be removed as the endpoint using it is to be deprecated.**

- **Usage**: _Moderators_  
- **Endpoints**: 
    - ``SUMMONER-V3``
    - ``STATS-V1.3``
- **Example of use**:

![http://i.imgur.com/E1cQeeL.png](http://i.imgur.com/E1cQeeL.png)


## Legal information
_Great Herald_ bot isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
