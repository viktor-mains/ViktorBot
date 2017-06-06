const Discord = require('discord.js');
var Roles = require('./roles.js');

exports.Ban = function (data) {
    var ban = this;

    ban.newUserIsBlacklisted = function (user) {
        for (i in ban.blacklist) {
            if (user.username.toLowerCase() == ban.blacklist[i][0].toLowerCase()
                && user.discriminator == ban.blacklist[i][1]) 
                return true;
        }
        return false;
    };
    ban.handleUserFromBlacklist = function (GuildMember) {
        var roles = new Roles.Roles(GuildMember);
        roles.addRoleToUser(`timeout`);
        GuildMember.user.send(`<:lazored:288786608952442881>`);

        var embed = new Discord.RichEmbed()
            .setTitle(`USER FROM BLACK LIST JOINS`)
            .setColor(0xB83FE0)
            .setDescription(`**User:** \`\`${GuildMember.user.username}#${GuildMember.user.discriminator}\`\`` +
            `\n**Timestamp:**\`\`${GuildMember.joinedAt}\`\``)
        data.bot.channels.get(data.logChannel).send({ embed });
        data.bot.channels.get(data.logChannel).send(`<@&207733800996831242> - user ${GuildMember.user.username}#${GuildMember.user.discriminator} got preemptively given a timeout role.`);
        return;
    };

    ban.blacklist = [
        [`Poro`, `0069`],
        [`Son`, `9765`],
        [`Fading`, `1461`],
        [`Kappacino`, `1440`],
        [`DidYouEatCrab`, `4893`],
        [`hothole`, `6007`],
        [`Dark Phoenix`, `4156`],
        [`dandeedandee`, `5917`],
        [`Snivel`, `4800`],
        [`Kronus`, `6870`],
        [`Shindae`, `3005`],
        [`Jesias`, `6016`],
        [`Ønly Rengar`, `7841`],
        [`Blue`, `2926`],
        [`Froze`, `0864`],
        [`Onee-chan~`, `6102`],
        [`cancer op`, `6587`],
        [`SlippB`, `1382`],
        [`Jesias`, `6016`],
        [`macc`, `0552`],
        [`Saware`, `4087`],
        [`infamous steady`, `9391`],
        [`206089`, `2511`],
        [`Turbovirginschwarzkopf`, `1400`],
        [`➣ 𝕲𝖆𝖇𝖗𝖎𝔢𝖑`, `7001`],
        [`Zenod`, `0071`],
        [`TisClobberinTime`, `7076`],
        [`Based Vassilij`, `0627`]];
};