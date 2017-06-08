const Discord = require('discord.js');
var Roles = require('./roles.js');

exports.Ban = function (data) {
    var ban = this;

    ban.newUserIsNameBlacklisted = function (user) {
        for (i in ban.blacklistNames) {
            if (user.username.toLowerCase() == ban.blacklistNames[i][0].toLowerCase()
                && user.discriminator == ban.blacklistNames[i][1]) 
                return true;
        }
        return false;
    };
    ban.newUserIsIDBlacklisted = function (user) {
        for (i in ban.blacklistIDs) {
            if (user.id == ban.blacklistIDs[i])
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

    ban.blacklistIDs = [`98492238086029312`,
        `106626853892075520`,
        `113741582531952641`,
        `122768454343196674`,
        `128845040985440256`,
        `130897211646017536`,
        `132520868772446208`,
        `132619868187918336`,
        `137720223791841280`,
        `143033916775727104`,
        `144116799695224832`,
        `145002865071489024`,
        `157565912600412160`,
        `161141217977958401`,
        `164562416707829760`,
        `178570357777629185`,
        `181157904668295168`,
        `185547232919945220`,
        `195971309392494593`,
        `200537080420499456`,
        `205778715479638016`,
        `215056515357343746`,
        `217818948656300032`,
        `218522963689865226`,
        `220652382072078336`,
        `226798673898504192`,
        `230600345208881152`,
        `232674777993707521`,
        `242398251855249428`,
        `258389365783396352`,
        `259012487284916225`,
        `264401507418374145`,
        `265319972258054144`,
        `286607630376632330`,
        `321464513377337344`,
        `321472015821307904`,
        `321484834331557889`,
        `321484914195300353`,
        `321492858727170049`,
        `321538465743241216`,
        `321540879896674304`,
        `321543551353880586`,
        `321545875442892801`,
        `321556650546823170`,
        `321592883985514496`,
        `321594021359124480`,
        `231563859666796544`,
        `126783435615240192`,
        `235145624528355328`,
        `125687680125239297`,
        `218061408439369728`,
        `139949478944833536`,
        `322064503711989771`,
        `153218420286947328`,
        `311406864309026826`,
        `322157859871784960`,
        `123483031288807424`,
        `234523847779549186`,
        `243700585302327297`];
    ban.blacklistNames = [
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
        [`TisClobberinTime`, `7076`]];
};