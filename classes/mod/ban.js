exports.Ban = function (data) {
    var ban = this;
    var Post = require('../post.js');
    var Input = require('../input.js');
    var post = new Post.Post(data);
    var input = new Input.Input();
    
    ban.ban = function () { //remake it so half of code doesn't repeat itself
        var fs = require('fs');
        var banPath = ('../data/mod/blackList.json');
        var idToBan = '';
        var lastMessage = 'null';
        var banOptions = input.removeKeyword(data.message.content).split('|');

        if (banOptions[1] == undefined)
            banOptions[1] = `Not specified`;
        if (data.message.mentions.users.first()) {
            banOptions[0] = data.message.mentions.users.first().username;
            idToBan = data.message.mentions.users.first().id;
            lastMessage = data.message.mentions.users.first().lastMessage;
        }
        if (!data.message.mentions.users.first()) {
            idToBan = banOptions[0].trim();
            try { lastMessage = data.message.guild.members.find('id', idToBan).lastMessage; }
            catch (err) { }; //if banned dude never was on server in the first place
        }
                
        fs.readFile(banPath, 'utf8', (err, fileContents) => {
            if (err)
                return post.embed(`:warning: Error while banning user`, [[`___`, `${err}`, false]]);
            var d = new Date();
            var serverID = data.message.guild.id;
            fileContents = JSON.parse(fileContents);

            for (i in fileContents.Blacklist) {
                if (fileContents.Blacklist[i].serverID == serverID) {
                    for (j in fileContents.Blacklist[i].bans) {
                        if (fileContents.Blacklist[i].bans[j].id == idToBan)
                            return post.embed(`:warning: Error while banning user`, [[`___`, `Can't ban user which is already banned.`, false]]);
                    };
                    fileContents.Blacklist[i].bans.push({
                        'id': idToBan,
                        'bannedBy': data.message.author.username,
                        'reason': banOptions[1]
                    });
                    fs.writeFile(banPath, JSON.stringify(fileContents), err => {
                        if (err)
                            return post.embed(`:warning: Error while banning user`, [[`___`, `${err}`, false]]);
                        if (data.message.guild.members.find('id', idToBan)) {
                            data.message.guild.ban(idToBan)
                                .then(user => { })
                                .catch((error) => {
                                    post.embed(`:warning: Error while banning user`, [[`___`, error, false]]);
                                });
                        };
                    });
                    return post.embedToChannel(`<:banhammer:310437806772060168> MEMBER BANNED`, [
                            [`User banned`, `${banOptions[0]} \n(${idToBan})`, true],
                            [`Banned by`, data.message.author.username, true],
                            [`Last message`, lastMessage, false],
                            [`Reason`, banOptions[1], false],
                            [`Date`, d, false],
                        ], data.logChannel, `F27900`);
                }
            }
            fileContents.Blacklist.push({
                'serverID': serverID,
                'bans': [{
                        'id': idToBan,
                        'bannedBy': data.message.author.username,
                        'reason': banOptions[1]
                    }]
            });
            fs.writeFile(banPath, JSON.stringify(fileContents), err => {
                if (err)
                    return post.embed(`:warning: Error while banning user`, [[`___`, `${err}`, false]]);
                if (data.message.guild.members.find('id', idToBan)) {
                    data.message.guild.ban(idToBan)
                        .then(user => { })
                        .catch((error) => {
                            post.embed(`:warning: Error while banning user`, [[`___`, error, false]]);
                        });
                };
            });
            return post.embedToChannel(`<:banhammer:310437806772060168> MEMBER BANNED`, [
                    [`User banned`, `${banOptions[0]} \n(${idToBan})`, true],
                    [`Banned by`, data.message.author.username, true],
                    [`Last message`, lastMessage, false],
                    [`Reason`, banOptions[1], false],
                    [`Date`, d, false],
                ], data.logChannel, `F27900`);
        });
    };
    ban.unban = function () {
        var fs = require('fs');
        var banPath = ('../data/mod/blackList.json');
        var idToUnban = input.removeKeyword(data.message.content);
        var reason = '';

        fs.readFile(banPath, 'utf8', (err, fileContents) => {
            if (err)
                return post.embed(`:warning: Error while unbanning user`, [[`___`, `${err}`, false]]);
            var d = new Date();
            var serverID = data.message.guild.id;
            fileContents = JSON.parse(fileContents);

            for (i in fileContents.Blacklist) {
                if (fileContents.Blacklist[i].serverID == serverID) {
                    for (j in fileContents.Blacklist[i].bans) {
                        if (fileContents.Blacklist[i].bans[j].id == idToUnban) {
                            reason = fileContents.Blacklist[i].bans[j].reason;
                            fileContents.Blacklist[i].bans.splice(j, 1);

                            fs.writeFile(banPath, JSON.stringify(fileContents), err => {
                                if (err)
                                    return post.embed(`:warning: Error while unbanning user`, [[`___`, `${err}`, false]]);
                                data.message.guild.unban(idToUnban)
                                    .then(user => { })
                                    .catch(error => { //this triggers when user gets banned by ID preventionally before even joining the server
                                        //post.embed(`:warning: Error while unbanning user`, [[`___`, error, false]])
                                    });
                                return post.embedToChannel(`<:banhammer:310437806772060168> MEMBER UNBANNED`, [
                                    [`User unbanned`, idToUnban, true],
                                    [`Unbanned by`, data.message.author.username, true],
                                    [`Reason for ban`, reason, false],
                                    [`Date`, d, false],
                                ], data.logChannel, `FF0088`);
                            });
                            return;
                        };
                    }
                }
            };
            return post.embed(`:warning: Error while unbanning user`, [[`___`, `Can't unban user which was not banned in the first place.`, false]]);
        });
    };
    ban.banList = function () {
        return post.embed(`:warning: Command unavailable`, [[`___`, `\`\`Not implemented yet!\`\``, false]]);
    };
   
};