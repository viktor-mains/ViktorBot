const Discord = require('discord.js');

exports.MessageCount = function (data) {
    var messageCount = this;
    var fs = require(`fs`);
    var Post = require(`../post.js`);
    var post = new Post.Post(data);
    var Input = require(`../input.js`);
    var input = new Input.Input();
    var messageCountPath = `../data/mod/messageCount.json`;

    messageCount.getMsgData = function (callback) {
        fs.readFile(messageCountPath, 'utf8', (err, messageData) => {
            if (err) {
                var d = new Date();
                console.log(`${d} - getting message data - ${err}\n`);
                return;
            }
            callback(JSON.parse(messageData));
        });
    };
    messageCount.setMsgData = function (global) {
        fs.writeFile(messageCountPath, JSON.stringify(global), err => {
            if (err) {
                var d = new Date();
                console.log(`${d} - setting message data - ${err}\n`);
            }
        });
    };

    messageCount.increment = function (msgCount, msg) {
        var serverID = msg.guild.id;
        var userID = msg.author.id;
        var newMsg = msg.content.replace(/"/g, "");

        if (!msgCount.hasOwnProperty(serverID))
            msgCount[serverID] = {};
        if (!msgCount[serverID].hasOwnProperty(userID)) { //if user was not registered before
            var mc = 0;
            msgCount[serverID][userID] = {
                "messageCount": 0,
                "firstMessage": Date.now(),
                "lastMsg": null,
                "lastMsgTimer": null,
                "newMsg": newMsg,
                "newMsgTimer": Date.now()
            };
        }
        mc = parseInt(msgCount[serverID][userID].messageCount);
        mc++;
        msgCount[serverID][userID].messageCount = mc;
        msgCount[serverID][userID].lastMsg = msgCount[serverID][userID].newMsg;
        msgCount[serverID][userID].lastMsgTimer = msgCount[serverID][userID].newMsgTimer;
        msgCount[serverID][userID].newMsg = newMsg;
        msgCount[serverID][userID].newMsgTimer = Date.now();
        messageCount.checkRegularRequirements(msgCount[serverID][userID], msg);
    }

    //i leave it only cause i don't remember that data.antispam did, so leaving it to remember it used to play a role here'
    /*messageCount.increment = function (callback) {
                fs.writeFile(messageCountPath, JSON.stringify(messageData), err => {
                    if (err) {
                        var d = new Date();
                        console.log(`${d} - ${err}\n`);
                        return callback(false, data.antispam);
                    }
                    return callback(true, data.antispam);
                });
            };
        });
    };*/
    
    messageCount.checkRegularRequirements = function (userData, msg) {
        //var arrayOfRanks = [`Fresh Acolyte`, `Junior Assistant`, `Hextech Progenitor`, `Arcane Android`];
        var memberRole = 'Junior Assistant';
        var regularRole = 'Hextech Progenitor';
        var fossilRole = 'Arcane Android';

        var Roles = require(`../roles.js`);
        var roles = new Roles.Roles(msg.guild.members.find('id', msg.author.id));

        if (roles.roleExists(memberRole) && roles.roleExists(regularRole) && roles.roleExists(fossilRole)) {
            if (userData.messageCount >= 5000 && Date.now() - userData.firstMessage > 31536000000 && !roles.userHasRole(fossilRole)) { //31536000000 = 1 year
                roles.addRoleToUser(fossilRole);
                var embed = new Discord.RichEmbed()
                    .setTitle(`<:hc3:236234891023482880> ${msg.author.username} promoted to ${fossilRole}! :trophy:`)
                    .setColor(`0xFDC000`)
                    .addField(`___`, `You have been amongst us for over a year already. Your loyalty to the Evolution has been recognized, and you deserve the best treatment.
                              \n\nFrom now on, you are known as one of the **${fossilRole}s**, carrying the Evolution's legacy with yourself wherever you go.`, false);
                    return msg.channel.send({ embed });
            }
            if (userData.messageCount >= 3000 && Date.now() - userData.firstMessage > 10518984000 && !roles.userHasRole(regularRole)) { //10518984000 = 4 months
                roles.addRoleToUser(regularRole);
                if (roles.userHasRole(memberRole))
                    roles.removeRoleFromUser(memberRole);
                if (!roles.userHasRole(fossilRole)) {
                    var embed = new Discord.RichEmbed()
                        .setTitle(`<:hc2:236234890532749313> ${msg.author.username} promoted to ${regularRole}! :cake:`)
                        .setColor(`0xFDC000`)
                        .addField(`___`, `You're amongst the most loyal Acolytes and regularly participate in our little community. Thank you.
                                \n\nFrom now on, you are known as one of the **${regularRole}s**. Have this cookie: :cookie:`, false);
                    return msg.channel.send({ embed });
                }
            }
            if (userData.messageCount >= 50 && !roles.userHasRole(memberRole) && !roles.userHasRole(regularRole) && !roles.userHasRole(fossilRole)) {
                roles.addRoleToUser(memberRole);
                var embed = new Discord.RichEmbed()
                    .setTitle(`<:hc1:236234890813636608> ${msg.author.username} promoted to ${memberRole}! :bouquet:`)
                    .setColor(`0xFDC000`)
                    .addField(`___`, `You started getting comfy in our little community, didn't you? \n\nAs a gift for your initial commitment, you now have the **${memberRole}** rank! Keep it up.`, false);
                return msg.channel.send({ embed });
            }
        }
    };
    messageCount.toMembership = function () {
        var joinDate = '';
        var numberOfMessages = '0';
        var serverID = data.message.guild.id;
        var userID = data.message.author.id;

        fs.readFile(messageCountPath, 'utf8', (err, messageData) => {
            if (err)
                return;
            try {
                messageData = JSON.parse(messageData);
            }
            catch (err) {
                var d = new Date();
                console.log(`${d} - ${err}\n`);
                post.embed(`:no_entry: Something _very bad_ happened.`, [
                    [`___`, `I can't proc this command and it's an indicator of something catastrophical happening. \nPlease, ping @Arcyvilk ASAP.`, false]]);
                return;
            }

            if (messageData.hasOwnProperty(serverID)) {
                if (messageData[serverID].hasOwnProperty(userID)) {
                    numberOfMessages = messageData[serverID][userID].messageCount;
                };
                joinDate = (new Date(data.message.guild.members.find('id', userID).joinedTimestamp)).toUTCString();
            };

            if (joinDate)
                return post.embed(`:notebook: ${data.message.author.username} membership data`, [
                    [`Messages written:`, numberOfMessages, true],
                    [`Member since:`, joinDate, true],]);
            return post.message(`:warning: This server does not have the messages database, therefore this command won't work.`);
        });
    };
    messageCount.toTopMembers = function () {
        fs.readFile(messageCountPath, 'utf8', (err, messageData) => {
            var serverID = data.message.guild.id;
            var membersArray = [];
            var list = "";

            if (err)
                return;
            try {
                messageData = JSON.parse(messageData);
            }
            catch (err) {
                var d = new Date();
                console.log(`${d} - ${err}\n`);
                post.embed(`:no_entry: Something _very bad_ happened.`, [
                    [`___`, `I can't proc this command and it's an indicator of something catastrophical happening. \nPlease, ping @Arcyvilk ASAP.`, false]]);
                return;
            }

            if (messageData.hasOwnProperty(serverID)) {
                for (let user in messageData[serverID]) {
                    membersArray.push({ "id": user, "count": messageData[serverID][user].messageCount });
                }
                membersArray.sort((user1, user2) => {
                    return user2.count - user1.count;
                });
                var memberListLength = 20;
                if (membersArray.length < memberListLength)
                    memberListLength = membersArray.length;
                for (let i = 0, j = 1; j < memberListLength; i++) {
                    if (data.message.guild.members.find('id', membersArray[i].id)) { //if the listed user is still on the server
                        switch (j) {
                            case 1: {
                                list += "\n🥇``";
                                break;
                            }
                            case 2: {
                                list += "\n🥈``";
                                break;
                            }
                            case 3: {
                                list += "\n🥉``";
                                break;
                            }
                            default: {
                                if (j < 10)
                                    list += `\n\`\`#${j} `;
                                else list += `\n\`\`#${j}`;
                                break;
                            }
                        }
                        list += ` - ${input.justifyToRight(membersArray[i].count.toString(), 6)} msg \`\` - **${data.message.guild.members.find('id', membersArray[i].id).user.username}**`;
                        j++;
                    }
                }
                return post.embed("Top members", [["___", list, false]]);
            };
            return post.embed("Top members", [["___", ":X: Members data for this server is not tracked. Apologies.", false]]);
        });
    }

    messageCount.checkAntiSpam = function (messageData) {
        var serverID = data.message.guild.id;
        var userID = data.message.author.id;

        if (messageData.Servers.hasOwnProperty(serverID)) {
            if (messageData.Servers[serverID][userID].lastMsg == data.message.content
                && messageData.Servers[serverID][userID].newMsgTimer - messageData.Servers[serverID][userID].lastMsgTimer <= (data.spamTime * 1000)) {
                if (!messageData.Servers[serverID][userID].hasOwnProperty('spamCounter')) {
                    messageData.Servers[serverID][userID]['spamCounter'] = parseInt(data.spamCount) - 2;
                }
                else {
                    messageData.Servers[serverID][userID].spamCounter = parseInt(messageData.Servers[serverID][userID].spamCounter) - 1;
                    if (messageData.Servers[serverID][userID].spamCounter == 0) {
                        var Roles = require(`../roles.js`);
                        var Post = require(`../post.js`);
                        var post = new Post.Post(data);
                        var roles = new Roles.Roles(data.message.guild.members.find('id', data.message.author.id));
                        var timeoutRole = `timeout`;

                        messageData.Servers[serverID][userID].messageCount = parseInt(messageData.Servers[serverID][userID].messageCount) - parseInt(data.spamCount);
                        delete messageData.Servers[serverID][userID].spamCounter;
                        if (roles.roleExists(timeoutRole))
                            roles.addRoleToUser(timeoutRole);
                        post.embed(`<:banhammer:310437806772060168> ${data.message.author.username} timeouted for spam`, [[`___`, `Seriously, stop it.`, false]]);
                        post.embedToChannel(`:timer: USER TIMEOUTED FOR SPAM`, [
                            [`User`, `${data.message.author.username}#${data.message.author.discriminator}`, false],
                            [`Spammed message`, `\`\`\`${data.message.content}\`\`\``, false]
                        ], data.logChannel, 'F27900');
                    }
                }
            }
            else {
                if (messageData.Servers[serverID][userID].hasOwnProperty('spamCounter'))
                    delete messageData.Servers[serverID][userID].spamCounter;
            };
        };
    };
};