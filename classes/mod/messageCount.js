exports.MessageCount = function (data) {
    var messageCount = this;
    var fs = require(`fs`);
    var messageCountPath = `../data/mod/messageCount.json`;

    messageCount.checkAntiSpam = function () {
        fs.readFile(messageCountPath, 'utf8', (err, messageData) => {
            if (err) {
                var d = new Date();
                console.log(`${d} - ${err}\n`);
                return;
            }
            var serverID = data.message.guild.id;
            var userID = data.message.author.id;
            messageData = JSON.parse(messageData);

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
                fs.writeFile(messageCountPath, JSON.stringify(messageData), err => {
                    if (err)
                        return;
                });
            };
        });
    };
    messageCount.increment = function (callback) {  
        fs.readFile(messageCountPath, `utf8`, (err, messageData) => {
            if (err) {
                var d = new Date();
                console.log(`${d} - ${err}\n`);
                return callback(false, data.antispam);
            }
            var serverID = data.message.guild.id;
            var userID = data.message.author.id;
            messageData = JSON.parse(messageData);

            if (messageData.Servers.hasOwnProperty(serverID)) {
                var mc = 0;
                if (!messageData.Servers[serverID].hasOwnProperty(userID)) {
                    messageData.Servers[serverID][userID] = {
                        "messageCount": 0,
                        "firstMessage": Date.now(),
                        "lastMsg": null,
                        "lastMsgTimer": null,
                        "newMsg": data.message.content,
                        "newMsgTimer": Date.now()
                    };
                }
                mc = parseInt(messageData.Servers[serverID][userID].messageCount);
                mc++;
                messageData.Servers[serverID][userID].messageCount = mc;
                messageData.Servers[serverID][userID].lastMsg = messageData.Servers[serverID][userID].newMsg;
                messageData.Servers[serverID][userID].lastMsgTimer = messageData.Servers[serverID][userID].newMsgTimer;
                messageData.Servers[serverID][userID].newMsg = data.message.content;
                messageData.Servers[serverID][userID].newMsgTimer = Date.now();
                messageCount.checkRegularRequirements(messageData.Servers[serverID][userID]);

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
    };
    messageCount.checkRegularRequirements = function (userData) {
        //var arrayOfRanks = [`Fresh Acolyte`, `Junior Assistant`, `Hextech Progenitor`, `Arcane Android`];
        var memberRole = 'Junior Assistant';
        var regularRole = 'Hextech Progenitor';
        var fossilRole = 'Arcane Android';

        var Roles = require(`../roles.js`);
        var Post = require(`../post.js`);
        var post = new Post.Post(data);
        var roles = new Roles.Roles(data.message.guild.members.find('id', data.message.author.id));

        if (roles.roleExists(memberRole) && roles.roleExists(regularRole) && roles.roleExists(fossilRole)) {
            if (userData.messageCount >= 5000 && Date.now() - userData.firstMessage > 31536000000 && !roles.userHasRole(fossilRole)) { //31536000000 = 1 year
                roles.addRoleToUser(fossilRole);
                post.embed(`:trophy: ${data.message.author.username} promoted to ${fossilRole}!`, [
                    [`___`, `You have been amongst us for over a year already. Your loyalty to the Evolution has been recognized, and you deserve the best treatment.` +
                        `\n\nFrom now on, you are known as one of the **${fossilRole}s**, carrying the Evolution's legacy with yourself wherever you go.`, false]]);
                return;
            }
            if (userData.messageCount >= 5000 && Date.now() - userData.firstMessage > 10518984000 && !roles.userHasRole(regularRole)) { //10518984000 = 4 months
                roles.addRoleToUser(regularRole);
                if (roles.userHasRole(memberRole))
                    roles.removeRoleFromUser(memberRole);
                if (!roles.userHasRole(fossilRole))
                post.embed(`:cake: ${data.message.author.username} promoted to ${regularRole}!`, [
                    [`___`, `You're amongst the most loyal Acolytes and regularly participate in our little community. Thank you.` +
                        `\n\nFrom now on, you are known as one of the **${regularRole}s**. Have this cookie: :cookie:`, false]]);
                return;
            }
            if (userData.messageCount >= 50 && !roles.userHasRole(memberRole) && !roles.userHasRole(regularRole) && !roles.userHasRole(fossilRole)) {
                roles.addRoleToUser(memberRole);
                post.embed(`:bouquet: ${data.message.author.username} promoted to ${memberRole}!`, [
                    [`___`, `You started getting comfy in our little community, do you? \n\nAs a gift for your initial commitment, you now have the **${memberRole}** rank! Keep it up.`, false]]);
                return;
            }
        }   
    };
    messageCount.getServerMessageCount = function () {

    };
};