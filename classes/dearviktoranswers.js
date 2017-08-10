exports.DearViktorAnswers = function () {
    var answers = this;
    
    answers.arcy = ["arcyvilk", "arcy", "your creator", "your maker", "person who made you", "man who made you", "guy who made you",
        "person who coded you", "man who coded you", "guy who coded you", "your coder", "your programmer",
        "artsee", "artzy", "arzy", "4rcy", "your designer", "your author", "your maker"];
    answers.arcyAnswers = ["You mean Arcy? That's, like, the single best person in existence.",
        "I'm sorry, I can't hear you over my creator's pure _awesomeness_.",
        "Arcy is the best and I agree with them on everything."];
    answers.list = [
    //NOPE
        "No. Leave me alone.",
        "_shakes head with disapproval_",
        "I don't see such possibility, unfortunately.",
        "Doubtful. Very. Doubtful. Very, very, _very_  doubtful.",
        "No, at least not in this particular spacetime.",
        "http://i.imgur.com/ftlyPXx.png",
        "My prognosis are rather... pessimistic.",
        "I am entirely sure this is doomed to fail in an instant it happens. If it ever does. What I highly doubt, by the way.",
        "The chance for it to happen equals to about 0.00019%, according to my calculations.",
    //YEP
        "I couldn't agree more.",
        "Yes, definitely. Why didn't I think about it myself?",
        "I see no reason for it not to happen.",
        "_sighs_ yes. Yes, I guess so.",
        "Well, I _kind of_  see some potential in that.",
        "Oh. So you actually _are_  able to have a good idea once in a while!",
        "...this... Actually... Might be true. Perhaps.",
        "It's actually not _that_  bad of an idea...",
        "The probability of that seems... surprisingly high.",
    //MAYBE
        "Is it possible? Surely, as long as you are not involved.",
        "If only you weren't so annoying; then _maybe_.",
        "I won't deny, but I also won't confirm.",
        "Hypothetically, everything is possible.",
        "If this ever happens, what I hope will not, it just _has_ to end with a disaster.",
    //AMBIVALENT
        "I have no time for your senseless questions.",
        "...and why would you ask _me_ that?",
        "Don't you see that I am busy?",
        "Are you incapable of figuring it out yourself?",
        "Don't you have anything better to do besides bothering me with your dumb questions?",
        "_stares silently, clearly unamused_",
        "<:vikwat:269523937669545987> _...what._",
        "I would suggest stop wasting your time asking questions and actually do something creative instead.",
        "I am not sure how do you imagine that to happen.",
        "I am a scientist, not a fortune teller.",
        "You just need to get good.",
        "Adapt, or be removed.",
        "...I refuse to answer this question.",
        "Hm, there's certainly an area to improvement.",
        "This query makes me question your sanity.",
        "Heh. So _naive_.",
        "I hope it will never happen in my close proximity.",
        "_grunting noises_\nStop bothering me ;-;"
    ];

    answers.arcyHappened = function (input) {
        for (var i = 0; i < answers.arcy.length-1; i++){
            if (input.toLowerCase().indexOf(answers.arcy[i]) !== -1)
                return true;
        }
        return false;
    };
};