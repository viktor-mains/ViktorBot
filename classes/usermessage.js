exports.UserMessage = function (data) {
    var userMessage = this;

    userMessage.content = data.message.content;
    userMessage.authorName = data.message.author.username;
    userMessage.authorID = data.message.author.id;

    userMessage.hasCommandTrigger = function () {
        if (userMessage.content.startsWith('!'))
            return true;
        return false;
    };
    userMessage.hasCapsLockTrigger = function () {
        if (userMessage.content === userMessage.content.toUpperCase() && userMessage.content.length>=20)
            return true;
        return false;
    };

    userMessage.hasDearViktorTrigger = function () {
        if ((userMessage.content.toLowerCase()).startsWith('dear viktor'))
            return true;
        return false;
    };
};