var Roles = require('./roles.js');

exports.Stream = function (member) {
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
    stream.addStreamingRoleIfTheyDontHaveItYet = function () {
        var roleName = 'Live Stream';
        if (!roles.userHasRole(roleName)) {
            roles.addRoleToUser(roleName);
        }
    };
    stream.removeStreamingRoleIfTheyStoppedStreaming = function () {
        var roleName = 'Live Stream';
        if (roles.userHasRole(roleName)) {
            roles.removeRoleFromUser(roleName);
        }
    };
};