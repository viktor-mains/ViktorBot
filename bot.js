var Discord = require('discord.io');
var bot = new Discord.Client({
    autorun: true,
    token: "[insert token here]"
});

//--------------------------------//
//.............EVENTS.............//
//--------------------------------//

bot.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});
bot.on('disconnect', function(errMsg, code) { 
	console.log('Failure detected: '+code+' - '+errMsg);
});
bot.on('presence', function(user, userID, status, game, event) {
	add_streaming_role(user, userID, status, game);
});
bot.on('message', function(user, userID, channelID, message, rawEvent) {
	var m=message;
	if (userID!="276781276898525184") //STOPS BOT FROM RESPONDING TO HIMSELF
	{
		if (m.startsWith('!'))
		{
			if ((m.toLowerCase()).startsWith('!matchup')) //MATCHUP COMMANDS
			{
				bot.sendMessage({
					to: channelID,
					message: matchup(((m.slice(9)).trim()).toLowerCase())});
			}
			if (m.startsWith('!iam')) //SERVER ASSIGN COMMANDS
			{
				add_role(m, userID, channelID);
			}
			if (m.startsWith('!rank'))
			{
				//add_rank
			}
			if (m.startsWith('!opgg'))
			{
				try
				{
					var p=(((m.slice(5)).trim()).replace(/ /g,"+")).split('|');
					bot.sendMessage({
						to: channelID,
						message: "https://"+p[0]+".op.gg/summoner/userName="+(p[1])});
				}
				catch(err)
				{
					bot.sendMessage({
						to: channelID,
						message: "I failed to retrieve the desired data, though, it probably wasn't anything interesting anyway."});
				}
			}
			if (m.toLowerCase()=="!meow")
			{
				try
				{
					var cat= "Can't get a cat because ";
					return_api("http://random.cat/meow", cat, function(api){
						bot.sendMessage({
							to: channelID,
							message: (JSON.parse(api)).file + " :cat: :3"});
					});
				}
				catch(err)
				{
					bot.sendMessage({
						to: channelID,
						message: "You have been given an oppretunity to ask me, an evoluted being, for anything; and you ask for a cat photo. _Really?_"});
				}
			}
			if (m.toLowerCase()=="!woof")
			{
				try
				{
					var cat= "Can't get a cat because ";
					return_api("http://random.dog/woof", cat, function(api){
						bot.sendMessage({
							to: channelID,
							message: "You have been given an oppretunity to ask me, an evoluted being, for anything; and you ask for a puppy photo. _Really?_"});
					});
				}
				catch(err)
				{
					bot.sendMessage({
						to: channelID,
						message: "You stand besides "});
				}
			}
			if (commands(m)!=0)
			{
				try{
					bot.sendMessage({
						to: channelID,
						message: commands(m)});
				}
				catch (err)
				{
					bot.sendMessage({
						to: channelID,
						message: "I refuse to execute your petty command."});
				}
			}
		}
		if (answers(m)!=0)
		{
			try
			{
			bot.sendMessage({
				to: channelID,
				message: answers(m)});
			}
			catch(err)
			{}
		}
	}
});

//------------------------------------------//
//.............CUSTOM RESPONSES.............//
//------------------------------------------//

function commands(m) //COMMANDS STARTING WITH "!"
{	
	m=m.toLowerCase();
	if (m=="!commands" || m=="!help" || m=="!h")
		return "- **Viktor related stuff:** !build | !matchup [champion_name] | !clubs"+
					"\n- **Streams:** !dun"+
					"\n- **Useful:** !opgg [server]|[ign] (example: !opgg euw|arcyvilk)"+
					"\n- **Other stuff:** hello | notice me senpai | !beep | !meow | !woof";
	else if (m=="!roles")
		return "**Self-assignable roles:** \n\n"+
					"- servers: BR | EUW | EUNE | NA | JP | Garena | KR | LAN | LAS | OCE | RU | TR\n"+
					"- are you a Viktor streamer? Type !iam Viktor Streamer";
	else if (m=="!dun")
		return "http://twitch.tv/dunlol - Challenger Viktor main";	
	else if (m=="!beep")
		return "_sighs deeply_ \nBeep. Boop.";
	else if (m=="!joke")
		return "I won't waste my precious time for the sake of your personal amusement.";
	else if (m=="!clubs")
		return "https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.";
	else if (m=="!build")
		return "**♥ GLORIOUS MINIGUIDE TO BUILD ♥**\n"+
					"-------------------------------\n"+
					"○ **First back:**\n\n"+
					"> 1250 g: <:hc1:242831892427177995> + <:potion:277494945332592640>\n"+
					"< 1250 g: <:doran:277494945261027328> + <:potion:277494945332592640>\n"+
					"< 1250 g vs LB, Kata, Syndra etc: <:negatron:277494945432993792> + <:potion:277494945332592640>\n"+
					"-------------------------------\n"+
					"○ **Standard build:** <:hc1:242831892427177995> → <:sheen:277494945500233728>/<:hc2:242831893051998218> → "+
					"<:sheen:277494945500233728>/<:hc2:242831893051998218> → <:hc3:242831893509308416> → <:lichbane:242831894134128650> → "+
					"<:rabadon:242831892854865922>/<:voidstaff:242831893899247616> → <:rabadon:242831892854865922>/<:voidstaff:242831893899247616> → "+
					"<:ga:273939560130674691>";	
	else return 0;
}

function answers(m) //ANSWERS FIND RANDOM WORDS IN SENTENCES AND REACT TO THEM
{
	m=m.toLowerCase();
	if ((m.indexOf("notice me")!=-1) && m.indexOf("senpai")!=-1)	
		return "_looks away, unamused_";
	else if	(m.indexOf("ily")!=-1 && m.indexOf("viktor")!=-1)	
		return "http://i.imgur.com/yuXRObM.png";
	else if (m.indexOf("hello")!=-1)
		return "Greetings, inferior construct!";
	else if (m.indexOf(":questionmark:")!=-1)
		return "<:questionmark:244535324737273857>";
	else if (m.indexOf("build")!=-1 && (m.indexOf("viktor")!=-1 || m.indexOf("vik")!=-1))
		return "It's highly adviced to check the !build command.";
	else if ((m.indexOf("club")!=-1 || m.indexOf("clubs")!=-1) && (m.indexOf("viktor")!=-1))
		return "https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.";
	else return 0;
}

function matchup(m) //MATCHUPS ARE... WELL, MATCHUPS
{
	var champ=m.toLowerCase();
	switch (champ)
	{
		case "ahri":
			return "https://www.reddit.com/r/viktormains/comments/4jz0os/weekly_matchup_discussion_1_viktor_vs_ahri/ - patch 6.10";
		case "anivia":
			return "https://www.reddit.com/r/viktormains/comments/577drz/weekly_matchup_discussion_13_viktor_vs_anivia/ - patch 6.20";
		case "azir":
			return "https://www.reddit.com/r/viktormains/comments/4n9zim/weekly_matchup_discussion_4_viktor_vs_azir/ - patch 6.11";
		case "brand":
			return "https://www.reddit.com/r/viktormains/comments/5age0w/weekly_matchup_discussion_15_viktor_vs_brand/ - patch 6.21";
		case "cassiopeia":
			return "https://www.reddit.com/r/viktormains/comments/58vglf/weekly_matchup_discussion_14_viktor_vs_cassiopeia/ - patch 6.21";
		case "ekko":
			return "https://www.reddit.com/r/viktormains/comments/5ghrj9/weekly_matchup_discussion_18_viktor_vs_ekko/ - patch 6.23";
		case "fizz":
			return "https://www.reddit.com/r/viktormains/comments/5hzr7p/weekly_matchup_discussion_19_viktor_vs_fizz/ - patch 6.24";
		case "gangplank": 
		case "gp":
			return "https://www.reddit.com/r/viktormains/comments/5qvxtj/weekly_matchup_discussion_23_viktor_vs_gangplank/ - patch 7.2";
		case "katarina":
		case "kata":
			return "https://www.reddit.com/r/viktormains/comments/4yiayv/weekly_matchup_discussion_10_viktor_vs_katarina/ - patch 6.16";
		case "leblanc": 
		case "lb":
			return "https://www.reddit.com/r/viktormains/comments/5o0qs8/weekly_matchup_discussion_21_viktor_vs_leblanc/ - patch 7.1";
		case "lux":
			return "https://www.reddit.com/r/viktormains/comments/4slxkv/weekly_matchup_discussion_8_viktor_vs_lux/ - patch 6.13";
		case "orianna":
			return "https://www.reddit.com/r/viktormains/comments/51bu9v/weekly_matchup_discussion_11_viktor_vs_orianna/ - patch 6.17";
		case "ryze": 
			return "https://www.reddit.com/r/viktormains/comments/5jb7li/weekly_matchup_discussion_20_viktor_vs_ryze/ - patch 6.24";
		case "syndra":
			return "https://www.reddit.com/r/viktormains/comments/4vi9nw/weekly_matchup_discussion_9_viktor_vs_syndra/ - patch 6.15";
		case "taliyah":
			return "https://www.reddit.com/r/viktormains/comments/5pmxq6/weekly_matchup_discussion_21_viktor_vs_taliyah/ - patch 7.1";
		case "twistedfate": 
		case "tf":
		case "twisted fate":
			return "https://www.reddit.com/r/viktormains/comments/4oes5m/weekly_matchup_discussion_5_viktor_vs_twisted_fate/ - patch 6.12";
		case "veigar": 
			return "https://www.reddit.com/r/viktormains/comments/5bmlxc/weekly_matchup_discussion_16_viktor_vs_veigar/ - patch 6.21";
		case "velkoz":
		case "vk":
		case "vel'koz":
			return "https://www.reddit.com/r/viktormains/comments/53vaa6/weekly_matchup_discussion_12_viktor_vs_velkoz/ - patch 6.17";
		case "yasuo":
			return "https://www.reddit.com/r/viktormains/comments/4m9ydy/weekly_matchup_discussion_3_viktor_vs_yasuo/ - patch 6.11";
		case "zed":
			return "https://www.reddit.com/r/viktormains/comments/4rc76d/weekly_matchup_discussion_7_viktor_vs_zed/ - patch 6.13";
		case "zyra":
			return "https://www.reddit.com/r/viktormains/comments/4q0r3f/weekly_matchup_discussion_6_viktor_vs_zyra/ - patch 6.12";	
		case "asshole":
			return "Unfortunately, we do not have a matchup discussion for Jayce yet. Sorry for inconvenience!";
		default:
			return "Code name ["+ champ.toUpperCase() +"]: missing data. This matchup hasn\'t been discussed yet, it seems.";
	}
}

//----------------------------------------------------//
//.............EXTERNAL API RELATED STUFF.............//
//----------------------------------------------------//

function return_api(url, topic, callback)
{
	var request = require('request');
	request(url, function (error, response, body) 
	{
		if (!error && response.statusCode == 200) 
		{
			return callback(body);
		}
		else
		{		
			return callback(topic+" "+error);
		}
	});
}

//---------------------------------------------------------//
//.............FUNCTIONS ASSOCIATED WITH ROLES.............//
//---------------------------------------------------------//

function add_role(m, userID, channelID)
{
	var r=m.slice(4); //JUST THE ROLE NAME - !IAM
		r=r.trim();					
	var r_id=0;
	var done=false;	
	var hasrole=false;
	
	try
	{
		for (var i in bot.servers[bot.channels[channelID].guild_id].roles)
		{
			if (bot.servers[bot.channels[channelID].guild_id].roles[i].name==r) 
			{
				r_id=bot.servers[bot.channels[channelID].guild_id].roles[i].id;
				break;
			}
		}
	}
	catch(err)
	{
		bot.sendMessage({
			to: channelID,
			message: err.toString()});
	}
	if (r_id==0) //IF DESIRED ROLE DOES NOT EXIST
	{
		bot.sendMessage({
			to: channelID,
			message: 'Such role doesn\'t exist. Check spelling.'});
	}
	else //IF DESIRED ROLE EXISTS
	{
		if (!checkrole('You already have the **'+r+'** role.', channelID, userID, r_id)) //IF USER DIDN'T HAVE THIS ROLE BEFORE
		{
			try
			{
				bot.addToRole({
					serverID: bot.channels[channelID].guild_id,
					userID: bot.users[userID].id,
					roleID: r_id});
							
				setTimeout(function(){
					if (!checkrole('Role **'+r+'** assigned with utmost efficiency.', channelID, userID, r_id)) //FAILED TO ASSIGN ROLE
					{
						bot.sendMessage({
							to: channelID,
							message: 'Failed to assign the **'+r+'** role.'});
					}
				}, 1000);
			}
			catch(err)
			{
				bot.sendMessage({
					to: channelID,
					message: 'Failed to assign the **'+r+'** role. ' + err});
			}
		}
	}
}

function checkrole(m, cid, uid, r_id) //CHECKS IF USER HAS A ROLE
{
	for (var i in bot.servers[bot.channels[cid].guild_id].members[uid].roles)
	{
		if (bot.servers[bot.channels[cid].guild_id].members[uid].roles[i]==r_id)
		{
			bot.sendMessage({
				to: cid,
				message: m});
			return true;
			break;
		}
	}
	return false;
}

function add_streaming_role(user, userID, status, game) //SERVER+ROLE ID HARDCODED; CHANGE TO BE MORE RESPONSIVE
{
	try
	{
		for (var i in bot.servers['207732593733402624'].members[userID].roles)
		{
			if (bot.servers['207732593733402624'].members[bot.users[userID].id].roles[i]=="277867725122961408") //CHECKS IF USER HAS VIKTOR STREAMER ROLE
			{
				if(game && game.url)
				{
					bot.addToRole({
						serverID: "207732593733402624",
						userID: bot.users[userID].id,
						roleID: "277436330609344513"});
						
					console.log(user+" - streams \'"+ game.name);
				}
			}
		}		
	}
	catch(err)
	{console.log(err);}
	
	try
	{
		if (!game || (game && !game.url)) //IF ISN'T IN GAME; OR IS IN GAME BUT DOESN'T STREAM
		{
			for (var i in bot.servers['207732593733402624'].members[userID].roles) 
			{
				if (bot.servers['207732593733402624'].members[bot.users[userID].id].roles[i]=="277436330609344513") //CHECKS FOR "STREAMING" ROLE
				{
					bot.removeFromRole({ //REMOVES "STREAMING" ROLE IF ONE HAD IT
						serverID: '207732593733402624', 
						userID: bot.users[userID].id,
						roleID: '277436330609344513'});
					console.log(user+" stopped streaming.");
				}
			}
		}
	}
	catch(err)
	{console.log(err);}
}