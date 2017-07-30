var Post = require('../post.js');

exports.Follow = function (data) {
    var follow = this;
    var post = new Post.Post(data);
    var roleName = `Viktor Streamer`;
    var followersPath = '../data/follow.json';

    follow.listOfStreamers = function () {
        var streamersList = ``;
        var viktorStreamers = data.message.guild.roles.find(`name`, roleName).members.forEach(member => {
            streamersList += `\`\`- ${member.user.id}\`\` - **${member.user.username}**\n`;
        });
        return post.embed(`<:viktorgod:269479031009837056> List of Viktor Streamers`, [
            [`___`, streamersList, false],
            [`How to follow a streamer`, `Copy the ID of the streamer you want to follow, \nand then simply use the \`\`!follow <id>\`\` ` +
                `command.\nTo undo it use \`\`!unfollow <id>\`\` command.`, false]]);
    };

    follow.start = function () {
        var fs = require('fs');
        var Input = require('../input.js');
        var input = new Input.Input();

        var streamerID = input.removeKeyword(data.message.content);
        var streamerExists = data.message.guild.members.find('id', streamerID);

        if (streamerID.indexOf(`<`) != -1 || streamerID.indexOf(`>`) != -1)
            return post.embed(`:warning: Incorrect input`, [[`___`, `**<** and **>** is supposed to indicate that this is a part where you put ` +
                `the ID. You don't _literally_ put **<** and **>** there. <:vikfacepalm:305783369302802434>`]]);
        if (isNaN(streamerID))
            return post.embed(`:warning: Incorrect input`, [[`___`, `I suggest writing ID of a person you want to follow.`, false]]);       
        if (!streamerExists)
            return post.embed(`:warning: Incorrect input`, [[`___`, `Person with such ID doesn't exist.`, false]]);
        if (!follow.isViktorStreamer(streamerID))
            return post.embed(`:warning: This person is not a Viktor Streamer`, [[`___`, `Person you tried to follow does not have _Viktor Streamer role_.` +
                `This means the bot won't post a notification when they go live nor will assign them the Live Stream role.`, false]]);

        fs.readFile(followersPath, 'utf8', (err, followerInfoJson) => {
            if (err) {
                post.embed(`:no_entry: Error`, [[`___`, `Something went wrong <:qqsob:292446164622770187>\n${err}`, false]]);
                return console.log(`Reading follow file: ${err}`);
            };
            var userNick = data.message.guild.members.find('id', streamerID).user.username;
            followerInfoJson = JSON.parse(followerInfoJson);

            if (follow.streamerIsOnTheList(followerInfoJson.Streamers, streamerID) == -1) {
                followerInfoJson.Streamers.push({
                    "id": streamerID,
                    "followers": [ data.message.author.id ]
                });
            }
            else {
                var id = follow.streamerIsOnTheList(followerInfoJson.Streamers, streamerID);
                
                if (follow.userAlreadyFollows(followerInfoJson.Streamers[id]))
                    return post.embed(`:warning: Can't do it`, [[`___`,`You already follow ${userNick}.`,false]]);
                followerInfoJson.Streamers[id].followers.push(data.message.author.id);
            };
            fs.writeFile(followersPath, JSON.stringify(followerInfoJson), err => {
                if (err) {
                    post.embed(`:no_entry: Error`, [[`___`, `Something went wrong <:qqsob:292446164622770187>\n${err}`, false]]);
                    return console.log(`Writing follow file: ${err}`);
                };
            });
            return post.embed(`<:viktorgod:269479031009837056> Follower alert`, [[`___`, `**${data.message.author.username}** now follows **${userNick}**.\n\n` +
                `To see the list of people you follow: \`\`!whoifollow\`\``, false]]); 
        });
    };
    follow.stop = function () {
        var fs = require('fs');
        var Input = require('../input.js');
        var input = new Input.Input();

        var streamerID = input.removeKeyword(data.message.content);
        var streamerExists = data.message.guild.members.find('id', streamerID);

        if (streamerID.indexOf(`<`) != -1 || streamerID.indexOf(`>`) != -1)
            return post.embed(`:warning: Incorrect input`, [[`___`, `**<** and **>** is supposed to indicate that this is a part where you put ` +
                `the ID. You don't _literally_ put **<** and **>** there. <:vikfacepalm:305783369302802434>`]]);
        if (isNaN(streamerID))
            return post.embed(`:warning: Incorrect input`, [[`___`, `I suggest writing ID of a person you want to unfollow.`, false]]);
        if (!streamerExists)
            return post.embed(`:warning: Incorrect input`, [[`___`, `Person with such ID doesn't exist.`, false]]);

        fs.readFile(followersPath, 'utf8', (err, followerInfoJson) => {
            if (err) {
                post.embed(`:no_entry: Error`, [[`___`, `Something went wrong <:qqsob:292446164622770187>\n${err}`, false]]);
                return console.log(`Reading follow file: ${err}`);
            };
            var userNick = data.message.guild.members.find('id', streamerID).user.username;
            followerInfoJson = JSON.parse(followerInfoJson);

            if (follow.streamerIsOnTheList(followerInfoJson.Streamers, streamerID) == -1)
                return post.embed(`:warning: Can't do it`, [[`___`, `You don't follow ${userNick}.`, false]]);
            var id = follow.streamerIsOnTheList(followerInfoJson.Streamers, streamerID);
            if (!follow.userAlreadyFollows(followerInfoJson.Streamers[i]))
                return post.embed(`:warning: Can't do it`, [[`___`, `You don't follow ${userNick}.`, false]]);
            if (followerInfoJson.Streamers[id].followers.length == 1)
                followerInfoJson.Streamers.splice(id, 1);
            else {
                for (i in followerInfoJson.Streamers[id].followers) {
                    if (followerInfoJson.Streamers[id].followers[i] == data.message.author.id)
                        followerInfoJson.Streamers[id].followers.splice(i,1);
                };
            }
            fs.writeFile(followersPath, JSON.stringify(followerInfoJson), err => {
                if (err) {
                    post.embed(`:no_entry: Error`, [[`___`, `Something went wrong <:qqsob:292446164622770187>\n${err}`, false]]);
                    return console.log(`Writing follow file: ${err}`);
                };
            });
            return post.embed(`<:JustDieAlready:288399448176853012> Unfollower alert`, [[`___`, `**${data.message.author.username}** no longer follows **${userNick}**.`, false]]); 
        });
    };
    follow.listOfMyFollowers = function () {
        var userID = data.message.author.id;
        var fs = require('fs');

        fs.readFile(followersPath, 'utf8', (err, followerInfoJson) => {
            if (err) {
                post.embed(`:no_entry: Error`, [[`___`, `Something went wrong <:qqsob:292446164622770187>\n${err}`, false]]);
                return console.log(`Reading follow file: ${err}`);
            };
            followerInfoJson = JSON.parse(followerInfoJson);
            for (i in followerInfoJson.Streamers) {
                if (followerInfoJson.Streamers[i].id == userID) {
                    var userFollowers = '';
                    for (j in followerInfoJson.Streamers[i].followers) {
                        try {
                            userFollowers = `${userFollowers}**${(parseInt(j) + 1)}**: ${data.message.channel.members.find('id', followerInfoJson.Streamers[i].followers[j]).user.username} \n`;
                        }
                        catch (err) { //when the guy following is no lnger on server
                            userFollowers = `${userFollowers}**${(parseInt(j) + 1)}**: ${followerInfoJson.Streamers[i].followers[j]} \n`;
                        }
                    }
                    return post.embed(`:notepad_spiral: People wasting time on ${data.message.author.username}'s stream`, [[`___`, userFollowers, false]]);
                }
            };
            return post.embed(`<:qqsob:292446164622770187> Forever alone`, [[`___`, `No one follows ${data.message.author.username} yet.\nSob, sob.`, false]]);
        });
    };
    follow.listOfWhoIFollow = function () {
        var userID = data.message.author.id;
        var followedStreamers = '';
        var fs = require('fs');

        fs.readFile(followersPath, 'utf8', (err, followerInfoJson) => {
            if (err) {
                post.embed(`:no_entry: Error`, [[`___`, `Something went wrong <:qqsob:292446164622770187>\n${err}`, false]]);
                return console.log(`Reading follow file: ${err}`);
            };
            followerInfoJson = JSON.parse(followerInfoJson);

            for (i in followerInfoJson.Streamers) {
                for (j in followerInfoJson.Streamers[i].followers) {
                    if (followerInfoJson.Streamers[i].followers[j] == userID) {
                        try
                        {
                            followedStreamers += `\`\`${followerInfoJson.Streamers[i].id}\`\` - **${data.message.channel.members.find('id', followerInfoJson.Streamers[i].id).user.username}**\n`;
                        }
                        catch (err) { //when the guy following is no longer on server
                            followedStreamers += `\`\`${followerInfoJson.Streamers[i].id}\`\`\n`;
                        }
                    }
                }
            };
            if (followedStreamers)
                return post.embed(`:notepad_spiral: People followed by you`, [[`___`, followedStreamers, false]]);
            return post.embed(`:notepad_spiral: People followed by you`, [[`___`, `You don't follow anyone yet.`, false]]);
        });
    };

    follow.isViktorStreamer = function (streamerID) {
        var viktorStreamers = [];
        data.message.guild.roles.find(`name`, roleName).members.forEach(member => {
            viktorStreamers.push(member.user.id);
        });
        for (i in viktorStreamers) {
            if (viktorStreamers[i] == streamerID)
                return true;
        }
        return false;
    };
    follow.userAlreadyFollows = function (input) {
        for (i in input.followers) {
            if (input.followers[i] == data.message.author.id)
                return true;
        };
        return false;
    };
    follow.streamerIsOnTheList = function (input, desiredId) {
        for (i in input) {
            if (input[i].id == desiredId)
                return i;
        };
        return -1;
    };
};