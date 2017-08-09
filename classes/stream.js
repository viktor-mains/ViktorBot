var Roles = require('./roles.js');

exports.Stream = function (member, data) {
    var stream = this;
    var roles = new Roles.Roles(member);

    stream.userStreams = function (game) {
        if (game && game.url)
            return true;
        return false;
    };
    stream.userDoesntStream = function (game) {
        if (!game || (game && !game.url))
            return true;
        return false;
    };
    stream.isViktorStreamer = function () {
        var VikStreamer = `Viktor Streamer`;

        if (!roles.roleExists(VikStreamer))
            return false;
        if (!roles.userHasRole(VikStreamer)) 
            return false;
        return true;
    };
    stream.informFollowers = function () {
        var fs = require('fs');
        var followersPath = '../data/follow.json';

        fs.readFile(followersPath, 'utf8', (err, followerInfoJson) => {
            if (err)
                return console.log(`Reading follow file for stream: ${err}`);
            followerInfoJson = JSON.parse(followerInfoJson);
            var Post = require('./post.js');
            var post = new Post.Post(data);
            var userFollowers = '';

            for (i in followerInfoJson.Streamers) {
                if (followerInfoJson.Streamers[i].id == member.user.id) {
                    for (j in followerInfoJson.Streamers[i].followers) {
                        if (member.guild.members.find('id', followerInfoJson.Streamers[i].followers[j]).presence.status != 'offline')
                            userFollowers += `${member.guild.members.find('id', followerInfoJson.Streamers[i].followers[j]).user.toString()} `;
                    }
                }
            };
            if (userFollowers)
                return post.messageToChannel(`📺 **${member.user.username} started streaming!**\n${member.presence.game.url}\n\n**Tagging:** ${userFollowers}`, data.strChannel);
            return post.messageToChannel(`📺 **${member.user.username} started streaming!**\n${member.presence.game.url}`, data.strChannel);
        });
    };
    stream.addStreamingRoleIfTheyDontHaveItYet = function () {
        var roleName = 'Live Stream';
        var d = new Date();

        if (!roles.userHasRole(roleName)) {
            roles.addRoleToUser(roleName);
            stream.informFollowers();
        }
    };
    stream.removeStreamingRoleIfTheyStoppedStreaming = function () {
        var roleName = 'Live Stream';
        if (roles.userHasRole(roleName)) {
            roles.removeRoleFromUser(roleName);
        }
    };
};