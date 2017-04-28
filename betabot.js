var Discord = require('discord.io');
var RITO_KEY=RIOT_KEY;

//var server_id="207732593733402624"; //server's id
//var log_id="303638628486086657"; //log rom id
//var flair_id="268354627781656577"; //flair room id
var testRoom="301546635991842827";
var adminID="165962236009906176";

var botVersion="The Great Herald beta 2.0: Remastering!";

var bot = new Discord.Client({
    autorun: true,
    token: API_KEY;
});

//--------------------------------//
//.............EVENTS.............//
//--------------------------------//
bot.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
	send.statusChange("lazoring birbs");
});
bot.on('disconnect', function(errMsg, code) {	
	console.log('Failure detected: '+code+' - '+errMsg);
	send.statusChange("crashed halp pls");
});
bot.on('message', function(user, userID, channelID, message, rawEvent) {
	if(userID!=bot.id)
	{
		response.getMessage(message);
		response.getMessageID(rawEvent.d.id);
		response.getUser(user);
		response.getUserID(userID);
		response.getChannelID(channelID);
		
		if (response.hasCommandTrigger())
			response.toCommand();
		if (response.hasCapsLockTrigger())
			response.toCapsLock();
		if (response.hasSmallTalkTrigger())
			send.normal(channelID, response.toDearViktor());
		
		if (response.hasManualResponseTrigger())
			send.normal(testRoom, message.slice(1).trim());
		if (response.hasStatusChangeRequest())
			send.statusChange(message.slice(1).trim());
	}
});

//------------------------------------------//
//............RESPONSE FUNCTIONS............//
//------------------------------------------//

var response=new function() 
{
		//VARS
	this.message="";
	this.messageID="";
	this.user="";
	this.userID="";
	this.channelID="";
	
		//GETTERS - RENAME TO SETTERS CUZ IM DUMB
	this.getMessage=function(fetchedMessage) 		{ this.message=fetchedMessage; }
	this.getMessageID=function(fetchedMessageID)	{ this.messageID=fetchedMessageID; }
	this.getUser=function(fetchedUser) 				{ this.user=fetchedUser; }
	this.getUserID=function(fetchedUserID) 			{ this.userID=fetchedUserID; }
	this.getChannelID=function(fetchedChannelID) 	{ this.channelID=fetchedChannelID; }
	
		//TRIGGERS
	this.hasCommandTrigger=function()
	{
		if (this.message.startsWith("!"))
			return true;
		return false;
	}
	this.hasManualResponseTrigger=function()
	{
		if (this.message.startsWith("%") && this.userID==adminID)// && this.channelID==bot.id)
			return true;
		return false;
	}
	this.hasCapsLockTrigger=function()
	{
		if (this.message==this.message.toUpperCase() && this.message.length>=20)
			return true;
		return false;
	}
	this.hasSmallTalkTrigger=function()
	{
		if (this.message.toLowerCase().startsWith("dear viktor"))
			return true;
		return false;
	}
	this.hasStatusChangeRequest=function()
	{
		if (this.message.startsWith("#") && this.userID==adminID)// && this.channelID==bot.id)
			return true;
		return false;
	}
	//function this.hasKeywordsTrigger() {}
	
		//ARCY
	this.arcyHappened=function() 
	{
		var arrayOfArcy=["arcyvilk", "arcy", "your creator", "your maker", "person who made you", "man who made you", "guy who made you", "artsee", "artzy", "arzy", "4rcy"];
		for (var i=0; i<arrayOfArcy.length-1; i++)
		{
			if (this.message.toLowerCase().indexOf(arrayOfArcy[i])!=-1)
				return true;
		}
		return false;
	}
	
		//ANSWERS
	this.toCapsLock=function()
	{
		if (RNG.chanceToHappen(10))
			return send.react(this.channelID, this.messageID, ":ahaok:288392049873518602");
		if (RNG.chanceToHappen(40))
			return send.react(this.channelID, this.messageID, "🍿");
	}
	this.toCommand=function()
	{
		var command=this.message.slice(1);
		if (command.indexOf(" ")!=-1)
			command=command.slice(0, command.indexOf(" ")).trim();
		for (var i=0; i<this.arrayOfCommands.length; i++)
		{
			if (this.arrayOfCommands[i][0]==command)
			{
				if (this.arrayOfCommands[i][2]!=null) //title is present, aka embed
					return send.embed(this.channelID, this.arrayOfCommands[i][1], this.arrayOfCommands[i][2]);
				return send.normal(this.channelID, this.arrayOfCommands[i][1]);
			}
		}
	}
	this.toDearViktor=function() 
	{
		if(this.arcyHappened())
			return this.arrayOfArcyAnswers[(Math.floor((Math.random() * (this.arrayOfArcyAnswers.length-1)) + 1))];
		return this.arrayOfDearViktorAnswers[(Math.floor((Math.random() * (this.arrayOfDearViktorAnswers.length-1)) + 1))];	
	}
	this.toMatchup=function() //problem: docierajaca tu wiadomosc jest nullem
	{
		var champion=this.message.slice(8).trim().toLowerCase();
		if (champion)
		{
			for (var i=0; i<=this.arrayOfMatchups.length; i++)
			{
				if ((this.arrayOfMatchups[i][0]).indexOf(champion)!=-1) //review cases like Vi/Viktor
					return this.arrayOfMatchups[i][1];
				if (i==this.arrayOfMatchups.length)
					return "Code name ["+champion.toUpperCase() +"]: missing data. This matchup hasn\'t been discussed yet, it seems.";	
			}
		}
		else return "I can't just _guess_ what champion you have in mind.";
	}
	this.toOPGG=function()
	{
	}
	this.toBuild=function()
	{
	}
	
		//ARRAYS
	this.arrayOfDearViktorAnswers=["", 
									//NOPE
								"No. Leave me alone.",
								"_shakes head with disapproval_",
								"I don't see such possibility, unfortunately.",
								"Doubtful. Very. Doubtful. Very, very, _very_  doubtful.",
								"No, at least not in this particular spacetime.",
								"http://i.imgur.com/ftlyPXx.png",
								"My prognosis are rather... pessimistic.",
								"I am entirely sure this is doomed to fail in an instant it happens. If it ever does. What I highly doubt, by the way.",
								"The chance for it to happen equals to about 0.00019%, according to my calculations.",
									//YEP
								"I couldn't agree more.",
								"Yes, definitely. Why didn't I think about it myself?",
								"I see no reason for it not to happen.",
								"_sighs_ yes. Yes, I guess so.",
								"Well, I _kind of_  see some potential in that.",
								"Oh. So you actually _are_  able to have a good idea once in a while!",
								"...this... Actually... Might be true. Perhaps.",
								"It's actually not _that_  bad of an idea...",
								"The probability of that seems... surprisingly high.",
									//MAYBE
								"Is it possible? Surely, as long as you are not involved.",
								"If only you weren't so annoying; then _maybe_.",
								"I won't deny, but I also won't confirm.",
								"Hypothetically, everything is possible.",
								"If this ever happens, what I hope will not, it just _has_ to end with a disaster.",	
									//AMBIVALENT
								"I have no time for your senseless questions.",
								"...and why would you ask _me_ that?",
								"Don't you see that I am busy?",
								"Are you incapable of figuring it out yourself?",
								"Don't you have anything better to do besides bothering me with your dumb questions?",
								"_stares silently, clearly unamused_",
								"<:vikwat:269523937669545987> _...what._",
								"I would suggest stop wasting your time asking questions and actually do something creative instead.",
								"I am not sure how do you imagine that to happen.",
								"I am a scientist, not a fortune teller.",
								"You just need to get good.",
								"Adapt, or be removed.",
								"...I refuse to answer this question.",
								"Hm, there's certainly an area to improvement.",
								"This query makes me question your sanity.",
								"Heh. So _naive_.",
								"I hope it will never happen in my close proximity.",
								"_grunting noises_\nStop bothering me ;-;"];
								
	this.arrayOfArcyAnswers=["", 
								"You mean Arcy? That's, like, the single best person in existence.",
								"I'm sorry, I can't hear you over my creator's pure _awesomeness_.",
								"Arcy is the best and I agree with them on everything."];
								
	this.arrayOfMatchups=[["ahri", "https://www.reddit.com/r/viktormains/comments/4jz0os/weekly_matchup_discussion_1_viktor_vs_ahri/ - patch 6.10"],
								["akali", "https://www.reddit.com/r/viktormains/comments/665z6g/weekly_matchup_discussion_31_viktor_vs_akali/ - patch 7.8"],
								["anivia", "https://www.reddit.com/r/viktormains/comments/577drz/weekly_matchup_discussion_13_viktor_vs_anivia/ - patch 6.20"],
								["annie", "https://www.reddit.com/r/viktormains/comments/5z1tsn/weekly_matchup_discussion_27_viktor_vs_annie/ - patch 7.5"],
								["aurelion|aurelion sol|asol|ao shin|aoshin|space dragon", "https://www.reddit.com/r/viktormains/comments/64hgp7/weekly_matchup_discussion_30_viktor_vs_aurelion/ - patch 7.7"],
								["azir", "https://www.reddit.com/r/viktormains/comments/4n9zim/weekly_matchup_discussion_4_viktor_vs_azir/ - patch 6.11"],
								["brand", "https://www.reddit.com/r/viktormains/comments/5age0w/weekly_matchup_discussion_15_viktor_vs_brand/ - patch 6.21"],
								["cassiopeia", "https://www.reddit.com/r/viktormains/comments/58vglf/weekly_matchup_discussion_14_viktor_vs_cassiopeia/ - patch 6.21"],
								["corki", "https://www.reddit.com/r/viktormains/comments/5wyrzo/weekly_matchup_discussion_26_viktor_vs_corki/ - patch 7.4"],
								["ekko", "https://www.reddit.com/r/viktormains/comments/5ghrj9/weekly_matchup_discussion_18_viktor_vs_ekko/ - patch 6.23"],
								["fizz", "https://www.reddit.com/r/viktormains/comments/5hzr7p/weekly_matchup_discussion_19_viktor_vs_fizz/ - patch 6.24"],
								["gangplank|gp", "https://www.reddit.com/r/viktormains/comments/5qvxtj/weekly_matchup_discussion_23_viktor_vs_gangplank/ - patch 7.2"],
								["katarina|kata", "https://www.reddit.com/r/viktormains/comments/5uzaqu/weekly_matchup_discussion_25_viktor_vs_katarina_2/ - patch 7.3"],
								["leblanc|lb", "https://www.reddit.com/r/viktormains/comments/5o0qs8/weekly_matchup_discussion_21_viktor_vs_leblanc/ - patch 7.1"],
								["lux", "https://www.reddit.com/r/viktormains/comments/4slxkv/weekly_matchup_discussion_8_viktor_vs_lux/ - patch 6.13"],
								["orianna", "https://www.reddit.com/r/viktormains/comments/51bu9v/weekly_matchup_discussion_11_viktor_vs_orianna/ - patch 6.17"],
								["ryze", "https://www.reddit.com/r/viktormains/comments/5jb7li/weekly_matchup_discussion_20_viktor_vs_ryze/ - patch 6.24"],
								["syndra", "https://www.reddit.com/r/viktormains/comments/4vi9nw/weekly_matchup_discussion_9_viktor_vs_syndra/ - patch 6.15"],
								["taliyah", "https://www.reddit.com/r/viktormains/comments/5pmxq6/weekly_matchup_discussion_21_viktor_vs_taliyah/ - patch 7.1"],
								["talon", "https://www.reddit.com/r/viktormains/comments/5srelp/weekly_matchup_discussion_24_viktor_vs_talon/ - patch 7.2"],
								["twistedfate|tf|twisted fate", "https://www.reddit.com/r/viktormains/comments/4oes5m/weekly_matchup_discussion_5_viktor_vs_twisted_fate/ - patch 6.12"],
								["veigar", "https://www.reddit.com/r/viktormains/comments/5bmlxc/weekly_matchup_discussion_16_viktor_vs_veigar/ - patch 6.21"],
								["velkoz|vk|vel'koz", "https://www.reddit.com/r/viktormains/comments/53vaa6/weekly_matchup_discussion_12_viktor_vs_velkoz/ - patch 6.17"],
								["xerath", "https://www.reddit.com/r/viktormains/comments/61nzof/weekly_matchup_discussion_29_viktor_vs_xerath/ - patch 7.6."],
								["yasuo", "https://www.reddit.com/r/viktormains/comments/4m9ydy/weekly_matchup_discussion_3_viktor_vs_yasuo/ - patch 6.11"],
								["zed", "https://www.reddit.com/r/viktormains/comments/4rc76d/weekly_matchup_discussion_7_viktor_vs_zed/ - patch 6.13"],
								["ziggs", "https://www.reddit.com/r/viktormains/comments/60flq2/weekly_matchup_discussion_28_viktor_vs_ziggs/ - patch 7.5"],
								["zyra", "https://www.reddit.com/r/viktormains/comments/4q0r3f/weekly_matchup_discussion_6_viktor_vs_zyra/ - patch 6.12"],
								["asshole", "Unfortunately, we do not have a matchup discussion for Jayce yet. Sorry for inconvenience!"]
							];
								
	this.arrayOfCommands=[["beep", "_sighs deeply_\nBeep. Boop.", null],
								["build", this.toBuild, "**♥ GLORIOUS MINIGUIDE TO BUILD ♥**"],
								["clubs", "https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.", null],
								["dun", "- OP.gg - https://na.op.gg/summoner/userName=dunv2\n- Stream - http://twitch.tv/dunlol", "Dun, Challenger Viktor main"],
								["faq", "Useful tips and tricks for new Viktor players: https://www.reddit.com/r/viktormains/wiki/faq",null],
								["joke", "I won't waste my precious time for the sake of your personal amusement.", null],
								["opgg", this.toOPGG(), null],
								["matchup", _this.toMatchup(), null],
								["roles",	"- servers: BR | EUW | EUNE | NA | JP | Garena | KR | LAN | LAS | OCE | RU | TR\n"+
											"- are you a Viktor streamer? Type !iam Viktor Streamer\n", "Self-assignable roles"],
								["test", "I am a tester version of myself.", null],
								["version", botVersion, null]		
							];
}

//------------------------------------------//
//...............OTHER HANDLES..............//
//------------------------------------------//

var RNG=new function()
{
	this.chanceToHappen=function(percentageChance) 
	{ 
		var drawnNumber = Math.floor((Math.random() * 100) + 1); 
		if (drawnNumber <= percentageChance)
			return true;
	}
}

var send=new function()
{
	this.normal=function(_channelID, _message)
	{
		bot.sendMessage({
			to: _channelID,
				message: _message});
	}
	this.embed=function(_channelID, _message, _title)
	{
		bot.sendMessage({
			to: _channelID,
			embed: {
				color: 0xfdc000, 
				title: _title, 
				description: _message}
			});
	}
	this.react=function(_channelID, _messageID, _reaction)
	{
		bot.addReaction({
			channelID: _channelID,
			messageID: _messageID,
			reaction: _reaction
			});
	}
	this.statusChange=function(_status)
	{
		bot.setPresence({
			idle_since: null,
			game: {
				name: _status
			}
		});
	}
}