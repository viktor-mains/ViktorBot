var Roles = require('./roles.js');

exports.Stream = function (member) {
    var stream = this;
    var roles = new Roles.Roles(member);

    stream.addStreamingRoleIfTheyDontHaveItYet = function () {
        var roleName = 'Live Stream';
        if (!roles.userHasRole(roleName)) {
            roles.addRoleToUser(roleName);
            var d = new Date();
            console.log(`${d}- ${member.user.username} started streaming!`);
        }
    };
    stream.removeStreamingRoleIfTheyStoppedStreaming = function () {
        var roleName = 'Live Stream';
        if (roles.userHasRole(roleName)) {
            roles.removeRoleFromUser(roleName);
            var d = new Date();
            console.log(`${d} - ${member.user.username} stopped streaming!`);
        }
    };
};