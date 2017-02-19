var Discord = require('discord.io');
var bot = new Discord.Client({
    autorun: true,
    token: process.env.API_KEY
});

//--------------------------------//
//.............EVENTS.............//
//--------------------------------//
bot.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
	bot.setPresence({
		idle_since: null,
		game: {
			name: "Glorious Evolution - !h for help"
		}
	});
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
			if (m.startsWith("!iam") && !(m.startsWith("!iamnot"))) 
			{
				if (channelID=="268354627781656577") //ASSIGN COMMANDS - ONLY IN #ASSIGN_FLAIR ROOM - WARNING: HARDCODED!!!
					add_role(m, userID, channelID);
				else
					send(channelID, "You can be anything you want, I'm not giving you any flair outside of the <#268354627781656577> room.");
			}
			else if (m.startsWith("!iamnot")) 
			{
				if (channelID=="268354627781656577") //ASSIGN COMMANDS - ONLY IN #ASSIGN_FLAIR ROOM - WARNING: HARDCODED!!!
					remove_role(m, userID, channelID);
				else
					send(channelID, "That's great to hear, but go to <#268354627781656577> room if you want to have it removed.");
			}
			else if (m.startsWith('!rank')) {} //IMPLEMENT
			else if ((m.toLowerCase()).startsWith('!matchup')) //MATCHUP COMMANDS
				send(channelID, matchup(((m.slice(8)).trim()).toLowerCase()));			
			else if (commands(channelID, m)!=0)
			{
				if (m!="!meow" && m!="!woof") //THOSE TWO ARE SPECIAL CASES AND SEND FROM THE BODY OF FUNCTION
				{
					try
					{	send(channelID, botrefuses(commands(channelID, m), "I refuse to execute your petty command."));}
					catch (err)
					{	send(channelID, "I refuse to execute your petty command.\n"+err);}
				}
			}
		}
		else if (answers(m)!=0)
		{
			try
			{	send(channelID, answers(m));}
			catch(err)
			{}
		}
		else if (m.toLowerCase().startsWith("dear viktor"))
			send(channelID, viktor_answers(m));
		else if (m.length>=20 && m===m.toUpperCase())
		{
			if (((Math.floor((Math.random() * 4) + 1)))%4==0)
				send(channelID, ":popcorn:");
		}
	}
});

function send(cid, m)
{
	bot.sendMessage({
		to: cid,
		message: m});
}

//------------------------------------------//
//.............CUSTOM RESPONSES.............//
//------------------------------------------//

function viktor_answers(m)
{
	if (!m.endsWith("?"))
	{
		return "_That_ doesn't look like a question to me.";
	}
	else
	{
		if (m.toLowerCase().indexOf("arcyvilk")!=-1 || m.toLowerCase().indexOf("arcy")!=-1)
		{
			return "Arcy is the best and I agree with them on everything.";
		}
		else 
		{
			switch(Math.floor((Math.random() * 31) + 1))
			{
				case 1:
					return "No. Leave me alone.";
				case 2:
					return "_shakes head with disapproval_";
				case 3:
					return "I have no time for your senseless questions.";
				case 4:
					return "...and why would you ask _me_ that?";
				case 5:
					return "I don't see such possibility, unfortunately.";
				case 6:
					return "Don't you see that I am busy?";
				case 7:
					return "Are you incapable of figuring it out yourself?";
				case 8:
					return "Is it possible? Surely, as long as you are not involved.";
				case 9:
					return "I couldn't agree more.";
				case 10:
					return "Yes, definitely. Why didn't I think about it myself?";
				case 11:
					return "Don't you have anything better to do besides bothering me with your dumb questions?";
				case 12:
					return "Doubtful. Very. Doubtful. Very, very, _very_  doubtful.";
				case 13:
					return "No, at least not in this particular spacetime.";
				case 14:
					return "I see no reason for it not to happen.";
				case 15:
					return "If only you weren't so annoying; then _maybe_.";
				case 16:
					return "_stares silently, clearly unamused_";
				case 17:
					return "<:vikwat:269523937669545987> _...what._";
				case 18:
					return "http://i.imgur.com/ftlyPXx.png";
				case 19:
					return "I would suggest stop wasting your time asking questions and actually do something creative instead.";
				case 20:
					return "_sighs_ yes. Yes, I guess so.";
				case 21:
					return "Well, I _kind of_  see some potential in that.";
				case 22:
					return "I am not sure how do you imagine that to happen.";
				case 23:
					return "I am a scientist, not a fortune teller.";
				case 24:
					return "You just need to get good.";
				case 25:
					return "Adapt, or be removed.";
				case 26:
					return "...I refuse to answer this question.";
				case 27:
					return "Hm, there's certainly an area to improvement.";
				case 28:
					return "I won't deny, but I also won't confirm.";
				case 29:
					return "This query makes me question your sanity.";
				case 30:
					return "Hypothetically, everything is possible.";
				case 31:
				default:
					return "_grunting noises_\nStop bothering me ;-;";
			}
		}
	}
}
function commands(cid, m) //COMMANDS STARTING WITH "!"
{	
	m=m.toLowerCase();
	if (m=="!commands" || m=="!help" || m=="!h")
		return "- **Viktor related stuff:** !build **||** !matchup [champion_name] **||** !clubs\n"+
					"- **Streams:** !dun\n"+
					"- **Useful:** !opgg [server]|[ign] (_example: !opgg euw|arcyvilk_)\n"+
					"- **Other commands:** dear viktor **||** hello **||** notice me senpai **||** !beep **||** !meow **||** !woof\n\n"+
					"- **Role assign:** server, rank and stream roles - visit <#268354627781656577> room for more info\n\n"+
					"In case of any bugs occuring, contact Arcyvilk#5460.";
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
	else if (m.startsWith('!opgg'))
	{
		try
		{
			if (m.indexOf('|')==-1)
				return "This command requires the symbol \"**|**\" to separate region from nickname. \n_Example:_ !opgg euw**|**"+user;
			else
			{
				var p=(((m.slice(5)).trim()).replace(/ /g,"+")).split('|');
				return botrefuses("https://"+p[0]+".op.gg/summoner/userName="+(p[1]), "I don't think you want to show _that_  to everyone.");
			}
		}
		catch(err)
		{
			return "I failed to retrieve the desired data, though, it probably wasn't anything interesting anyway.";
		}
	}
	else if (m=="!meow") //SPECIAL CASE - SENDS FROM HERE
	{
		try
		{
			return_api("http://random.cat/meow", function(api){
				if (api!="error")
					send(cid, botrefuses((JSON.parse(api)).file + " :cat: :3", "You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a cat photo. _Really?_"));
				else 
					send(cid, "Can't get a cat.");
			});
		}
		catch(err)
		{	send(cid,"You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a cat photo. _Really?_\n"+err);}
	}
	else if (m=="!woof") //SPECIAL CASE - SENDS FROM HERE
	{
		try
		{
			return_api("http://random.dog/woof", function(api){
				if (api!="error")
					send(cid, botrefuses("http://random.dog/"+api + " :dog: :3", "You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a puppy photo. _Really?_"));
				else
					send(cid, "Can't get a dog.");
			});
		}
		catch(err)
		{	send(cid, "You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a puppy photo. _Really?_\n"+err);}
	}
	else if (m=="!build")
		return "**♥ GLORIOUS MINIGUIDE TO BUILD ♥**\n"+
					"-------------------------------\n"+
					"○ **First back:**\n\n"+
					"> 1250 g: <:hc1:242831892427177995> + <:potion:277494945332592640>\n"+
					"< 1250 g: <:doran:277494945261027328> + <:potion:277494945332592640>\n"+
					"< 1250 g vs LB, Kata, Syndra etc: <:negatron:277494945432993792> + <:potion:277494945332592640>\n"+
					"-------------------------------\n"+
					"○ **Default build:** <:hc1:242831892427177995> → <:sheen:277494945500233728>/<:hc2:242831893051998218> → "+
					"<:sheen:277494945500233728>/<:hc2:242831893051998218> → <:hc3:242831893509308416> → <:lichbane:242831894134128650> → "+
					"<:rabadon:242831892854865922>/<:voidstaff:242831893899247616> → <:rabadon:242831892854865922>/<:voidstaff:242831893899247616> → "+
					"<:zhonya:242831893953773569>/<:ga:273939560130674691>";
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
	{	
		var qm="";
		var rand=Math.floor((Math.random() * 10) + 1);
		for (var i=1; i<=rand; i++)
			qm=qm+"<:questionmark:244535324737273857>";
		return qm;
	}
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
		case "talon":
			return "https://www.reddit.com/r/viktormains/comments/5srelp/weekly_matchup_discussion_24_viktor_vs_talon/ - patch 7.2";
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
function botrefuses(normal, refusal)
{
	var rand=Math.floor((Math.random() * 100) + 1); 
	if (rand<2)
	{
		return refusal;
	}
	else return normal;
}
//----------------------------------------------------//
//.............EXTERNAL API RELATED STUFF.............//
//----------------------------------------------------//

function return_api(url, callback)
{
	var request = require('request');
	request(url, function (error, response, body) 
	{
		if (!error && response.statusCode == 200)
			return callback(body);
		else
		{
			try
			{
				return callback("error "+response.statusCode);
			}
			catch(err)
			{
				return callback("error "+err);
			}
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

	if (r.toLowerCase()=="bad" || r.toLowerCase()=="noob" || r.toLowerCase()=="retard" || r.toLowerCase()=="retarded") //SOME INNOCENT TROLLING
		send(channelID, "Indeed. You are.");
	if (r.toLowerCase()=="bronze")
		send(channelID, "You aren't, but you truly deserve it.");
	
	for (var i in bot.servers[bot.channels[channelID].guild_id].roles)
	{
		if ((bot.servers[bot.channels[channelID].guild_id].roles[i].name).toLowerCase()==r.toLowerCase()) 
		{
			r_id=bot.servers[bot.channels[channelID].guild_id].roles[i].id;
			break;
		}
	}
	if (r_id==0) //IF DESIRED ROLE DOES NOT EXIST
		send(channelID, "Such role doesn\'t exist. Check spelling.");
	else //IF DESIRED ROLE EXISTS
	{
		if (!checkrole(channelID, userID, r_id)) //IF USER DIDN'T HAVE THIS ROLE BEFORE
		{
			try
			{
				bot.addToRole({
					serverID: bot.channels[channelID].guild_id,
					userID: userID,
					roleID: r_id});
							
				setTimeout(function(){
					if (!checkrole(channelID, userID, r_id)) //FAILED TO ASSIGN ROLE
						send(channelID, "Failed to assign the **"+r+"** role.");
					else
						send(channelID, "Role **"+r+"** assigned with utmost efficiency.");
				}, 1000);
			}
			catch(err)
			{
				send(channelID, "Failed to assign the **"+r+"** role. " + err);
			}
		}
		else
			send(channelID, "You already have the **"+r+"** role.");
	}
}
function remove_role(m, userID, channelID)
{
	var r=m.slice(7); //JUST THE ROLE NAME - !IAMNOT
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
		send(channelID, "Finding role for user "+bot.members[userID].name +" - error detected: "+err.toString());
	}
	if (r_id==0) //IF DESIRED ROLE DOES NOT EXIST
		send(channelID,'Such role doesn\'t exist. Check spelling.');
	else //IF DESIRED ROLE EXISTS
	{
		if (checkrole(channelID, userID, r_id)) //IF USER DOES HAVE THIS ROLE
		{
			try
			{
				bot.removeFromRole({
					serverID: bot.channels[channelID].guild_id,
					userID: bot.users[userID].id,
					roleID: r_id});
							
				setTimeout(function(){
					if (checkrole(channelID, userID, r_id)) //IF FAILED TO REMOVE FROM ROLE
						send(channelID, "Failed to assign the **"+r+"** role.");
					else
						send(channelID, "Role **"+r+"** removed succesfully.");
				}, 1000);
			}
			catch(err)
			{
				send(channelID, "Failed to assign the **"+r+"** role. " + err);
			}
		}
		else
			send(channelID, "Indeed, you aren't.");
	}
	
}
function add_streaming_role(user, userID, status, game) //SERVER+ROLE ID HARDCODED; CHANGE TO BE MORE RESPONSIVE
{
	if(game && game.url) //IF USER IS DETECTED AS STREAMING
	{
		try
		{
			for (var i in bot.servers['207732593733402624'].members[userID].roles)
			{
				if (bot.servers['207732593733402624'].members[userID].roles[i]=="277867725122961408") //CHECKS IF USER HAS VIKTOR STREAMER ROLE
				{
					bot.addToRole({
						serverID: "207732593733402624",
						userID: userID,
						roleID: "277436330609344513"});
						
					console.log(user+" - streams \'"+ game.name);
				}
			}
		}		
		catch(err)
		{console.log("- "+user+"- "+userID+" - "+game+" - presence change, streaming detected error - "+err);}
	}
	if (!game || (game && !game.url)) //IF ISN'T IN GAME; OR IS IN GAME BUT DOESN'T STREAM
	{
		try
		{
			for (var i in bot.servers['207732593733402624'].members[userID].roles) 
			{
				if (bot.servers['207732593733402624'].members[userID].roles[i]=="277436330609344513") //CHECKS FOR "STREAMING" ROLE
				{
					bot.removeFromRole({ //REMOVES "STREAMING" ROLE IF ONE HAD IT
						serverID: '207732593733402624', 
						userID: userID,
						roleID: '277436330609344513'});
					console.log(user+" stopped streaming.");			
				}
			}
		}
		catch(err)
		{console.log("- "+user+" - "+userID+" - presence change, streaming undetected error - "+err);}
	}
}
function checkrole(cid, uid, r_id) //CHECKS IF USER HAS A ROLE
{
	for (var i in bot.servers[bot.channels[cid].guild_id].members[uid].roles)
	{
		if (bot.servers[bot.channels[cid].guild_id].members[uid].roles[i]==r_id)
			return true;
	}
	return false;
}