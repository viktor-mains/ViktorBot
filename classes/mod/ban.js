﻿exports.Ban = function (data) {
    var ban = this;
    var Post = require('../post.js');
    var Input = require('../input.js');
    var fs = require('fs');
    var post = new Post.Post(data);
    var input = new Input.Input();
    var banPath = ('../data/mod/blackList.json');

    ban.newUserIsBlacklisted = function (GuildMember, callback) {
        fs.readFile(banPath, 'utf8', (err, fileContents) => {
            if (err)
                return false;
            fileContents = JSON.parse(fileContents);
            for (i in fileContents.Blacklist) {
                if (fileContents.Blacklist[i].serverID == GuildMember.guild.id) {
                    for (j in fileContents.Blacklist[i].bans) {
                        if (fileContents.Blacklist[i].bans[j].id == GuildMember.user.id) {
                            callback(true);
                            return;
                        }
                    }
                }
            };
            callback(false);
        });
    };
    ban.handleUserFromBlacklist = function (GuildMember) {
        GuildMember.ban();
        GuildMember.user.send(`<:lazored:288786608952442881>`);
    };


    ban.ban = function () { 
        var d = new Date();
        var banOptions = input.removeKeyword(data.message.content).split('|');
        var idToBan = banOptions[0];

        if (banOptions[1] == undefined)
            banOptions[1] == `No reason specified.`;
        if (data.message.mentions.users.first()) { //if banned by mention
            data.message.guild.ban(data.message.mentions.users.first().id)
                .then(user => {
                    post.embedToChannel(`<:banhammer:310437806772060168> MEMBER BANNED`, [
                        [`User banned`, `${banOptions[0]} \n(${data.message.mentions.users.first().id})`, true],
                        [`Banned by`, data.message.author.username, true],
                        [`Last message`, data.message.mentions.users.first().lastMessage, false],
                        [`Reason`, banOptions[1], false],
                        [`Date`, d, false],
                    ], data.logChannel, `F27900`);
                    return post.embed(`:white_check_mark: Success!`, [[`___`, `${banOptions[0]} banned! Hopefully they deserved it.`, false]]);
                })
                .catch(error => {
                    return post.embed(`:warning: Error while banning user`, [[`___`, `${error}`, false]]);
                });
        }
        else { //if banned by ID & is on the server
            var userIsOnThisServer = data.message.guild.members.get(idToBan);
            if (userIsOnThisServer) {
                data.message.guild.ban(idToBan)
                    .then(user => {
                        post.embedToChannel(`<:banhammer:310437806772060168> MEMBER BANNED`, [
                            [`User banned`, `${userIsOnThisServer.user.username}\n(${idToBan})`, true],
                            [`Banned by`, data.message.author.username, true],
                            [`Reason`, banOptions[1], false],
                            [`Date`, d, false],
                        ], data.logChannel, `F27900`);
                        return post.embed(`:white_check_mark: Success!`, [[`___`, `${userIsOnThisServer.user.username} banned! Hopefully they deserved it.`, false]]);
                    })
                    .catch(error => {
                        return post.embed(`:warning: Error while banning user`, [[`___`, `${error}`, false]]);
                    });
            }
            else {
                //add to blacklist and wait for him to come >:3c
                //fs.readFile(banPath, 'utf8', (err, fileContents) => {

                //});
                post.message(`This person is not on server and will get blacklisted instead of banned`);
            }
        }
    };
    ban.unban = function () {
        var d = new Date();
        var idToUnban = input.removeKeyword(data.message.content);

        data.message.guild.fetchBans() //to sie dzieje gdy sie unbanowywuje z ID kogoś, kto faktycznie został zbanowany
            .then(banList => {
                var wasOnBanList = banList.get(idToUnban);
                if (wasOnBanList) {
                    data.message.guild.unban(idToUnban)
                        .then(user => {
                            post.embedToChannel(`<:banhammer:310437806772060168> MEMBER UNBANNED`, [
                                [`User unbanned`, `${idToUnban})`, true],
                                [`Unbanned by`, data.message.author.username, true],
                                //  [`Reason for original ban`, wasOnBanList.reason, false],
                                [`Date`, d, false],
                            ], data.logChannel, `FF0088`);
                            return post.embed(`:white_check_mark: Success!`, [[`___`, `${idToUnban} unbanned!`, false]]);
                        })
                        .catch(error => {
                            return post.embed(`:warning: Error while unbanning user`, [[`___`, `${error}`, false]]);
                        });
                }
                else {
                    fs.readFile(banPath, 'utf8', (err, blackList) => {
                        if (err)
                            return post.embed(`:warning: Error while unbanning user`, [[`___`, `${err}`, false]]);
                        var serverID = data.message.guild.id;
                        blackList = JSON.parse(blackList);

                        if (blackList.Blacklist.hasOwnProperty(serverID)) {
                            for (i in blackList.Blacklist[serverID].bans) {
                                if (blackList.Blacklist[serverID].bans[i].id == idToUnban) {
                                    var reason = blackList.Blacklist[serverID].bans[i].reason;
                                    blackList.Blacklist[serverID].bans.splice(i, 1);
                                    fs.writeFile(banPath, JSON.stringify(blackList), err => {
                                        if (err)
                                            return post.embed(`:warning: Error while unbanning user`, [[`___`, `${error}`, false]]);
                                        post.embedToChannel(`<:banhammer:310437806772060168> MEMBER REMOVED FROM BLACKLIST`, [
                                            [`User`, `${idToUnban})`, true],
                                            [`Unbanned by`, data.message.author.username, true],
                                            [`Reason for original ban`, reason, false],
                                            [`Date`, d, false],
                                        ], data.logChannel, `FF0088`);
                                        return post.embed(`:white_check_mark: Success!`, [[`___`, `${idToUnban} removed from blacklist!`, false]]);
                                    });
                                }
                            }
                            return post.embed(`:warning: Error while unbanning user`, [[`___`, `Can't unban user who ain't banned yet.`, false]]);
                        }
                        else
                            return post.embed(`:warning: Error while unbanning user`, [[`___`, `Can't unban user who ain't banned yet.`, false]]);
                    });
                }
            })
            .catch(error => {
                return post.embed(`:warning: Error while unbanning user`, [[`___`, `${error}`, false]]);
            });
    };
    ban.banList = function () {
        fs.readFile(banPath, 'utf8', (err, fileContents) => {
            if (err)
                return post.embed(`:warning: Error while unbanning user`, [[`___`, `${err}`, false]]);
            var d = new Date();
            var serverID = data.message.guild.id;
            var listOfBans = '';
            fileContents = JSON.parse(fileContents);

            for (i in fileContents.Blacklist) {
                if (fileContents.Blacklist[i].serverID == serverID) {
                    for (j in fileContents.Blacklist[i].bans)
                        listOfBans += `**${fileContents.Blacklist[i].bans[j].id}** - ${fileContents.Blacklist[i].bans[j].reason}\n`;
                    return post.embed(`:no_entry_sign: Blacklist`, [[`___`, listOfBans, false]]);
                }
            }
            return post.embed(`🤗 No one is on blacklist yet!`, [[`___`, `You should be happy.`, false]]);
        });
    };
};