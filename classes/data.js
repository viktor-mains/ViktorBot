/**
 * This is a class which stores all the consts that main events return, and which are crucial to other classes.
 * Its purpose is to gather all the consts needed in other classes, so passing multiple, hard to remember arguments, to every class can be avoided.
 * In such case just pass the Data() object which was crated initially in the event and you're set.
 *
 * Stores also stuff that shold be kept in database, but I am noob and I can't into databases.
 *
 * @param message - for fetching author ID, channel ID, message contents etc
 * @param bot     - for fetching bot's ID, guilds and channels
 */

exports.Data = function (message, bot) {
    var data = this;
    data.message = message;
    data.bot = bot;
    
    data.version = 'The Great Herald beta 2.07: !lastgame command';

    data.logChannel = '';
    data.roleChannel = '';
    data.spamChannel = '';
    data.offTop = '247501730336604163'; //hardcoded offtop from vikmains

    data.whatServer = function (serverID) {
        switch (serverID) {
            case '207732593733402624': //vikmains
                {
                    data.logChannel = '315258332749234189';
                    data.roleChannel = '268354627781656577';
                    data.spamChannel = '290601371370127361';
                    data.offTop = '247501730336604163';
                    break;
                }
            case '234740225782317057': //arcytesting
                {
                    data.logChannel = '310735697260707841';
                    data.roleChannel = '310735697260707841';
                    data.spamChannel = '310735697260707841';
                    data.offTop = '310735697260707841';
                    break;
                }
            default: return null; //zrobi? tu ?eby zwraca?o DM bota kiedy si? gada z nim przez DM
        }
    };

    data.userIsNotThisBot = function () {
        if (message.author.id !== bot.user.id)
            return true;
        return false;
    };
};