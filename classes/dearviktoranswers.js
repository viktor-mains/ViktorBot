exports.DearViktorAnswers = function (msg) {
    var nlp = require('compromise');
    var RNG = require('./rng.js');
    var rng = new RNG.RNG();
    var dva = this;
    dva.msg = msg.substring(11).replace(",", " ").trim();

    dva.determineAnswer = function () {
        for (let i in dva.questions) {
            if (msg.indexOf(i) != -1)
                return dva.answers[dva.questions[i]][rng.chooseRandom(dva.answers[dva.questions[i]].length)];
        }
        for (let j in dva.yesnoquestions) {
            if (dva.msg.startsWith(dva.yesnoquestions[j])) {
                return dva.yesnoanswers[rng.chooseRandom(dva.yesnoanswers.length)];
            }
        }
        return dva.computeAnswer();
    };

    dva.questions = {
        "arcy": "arcyanswers",
        "your creator": "arcyanswers",
        "your maker": "arcyanswers",
        "person who made you": "arcyanswers",
        "man who made you": "arcyanswers",
        "guy who made you": "arcyanswers",
        "person who coded you": "arcyanswers",
        "man who coded you": "arcyanswers",
        "guy who coded you": "arcyanswers",
        "your coder": "arcyanswers",
        "your programmer": "arcyanswers",
        "your author": "arcyanswers",
        "your maker": "arcyanswers",
        "yor designer": "arcyanswers",
        "artsee": "arcyanswers",
        "artzy": "arcyanswers",
        "arzy": "arcyanswers",
        "4rcy": "arcyanswers",
        "jayce": "jayce"
    };
    dva.yesnoquestions = [
        "are",
        "do you",
        "did",
        "have you",
        "should",
        "is",
        "am i",
        "can",
        "shall",
        "would"
    ];
    dva.nounAnswers = [
        "To be fair, I consider # obscene.",
        "I'm not nearly as knowleadgable on # as you apparently consider me to be, but it doesn't sound as bad, I guess.",
        "Topic of # is kind of alien to me. I'm afraid I'm unable to help you.",
        "I can say for sure that # absolutely _suck_.",
        "Huh, #? Why would you waste my time asking about something so absolutely _insignificant_?",
        "...# are probably the worst thing that happened to mankind to date.",
        "I'm not interested in # and you should not be too.",
        "Aren't you a bit too old to be excited about #?",
        "When I was your age, I studied quantum physics instead of wasting my time on #.",
        "Oh, # are my guilty pleasure.",
        "Heh, funny that you ask. I was _just_ finishing a book about #. I can give you a short lecture about it.",
        "No. No, no no, _no_. Please never mention # in my proximity again.",
        "Why is my opinion on # so important to you? Just do whatever you consider appropriate.",
        "Well, I consider # a waste of space and resources.",
        "If not for # my life would be infinitely easier so please let's not talk to me about them ever again.",
        "I'm fairly enthusiastic about #, a bright future is attached to their existence.",
        "...well, for each their own, I guess. I am interested in nuclear fusion, you are interested in #.",
        "Maybe you should just google it. I might be a cyborg but my memory's capacity is not infinite to waste it on everything.",
        "I briefly heard something about # before. My conscious decision was to stay asfar away from this topic as I could. Cannot help you.",
        "My research suggests it's not really worth my time.",
        "Oh! Finally someone else being enthusiastic about #! Visit me in my lab sometime.",
        "When i was younger I was fairly excited about #. It's in the past, however.",
        "If I had more time I would do more research on #, it's a fascinating topic I must admit.",
        "...well, I wouldn't expect you of all people to be interested in #...",
        "...# you say. Well. I shou;d've expect such kind of interests from _you_."
    ];
    dva.yesnoanswers = [
            //NOPE
        "No. Leave me alone.",
        "_shakes head with disapproval_",
        "I don't see such possibility, unfortunately.",
        "Doubtful. Very. Doubtful. Very, very, _very_  doubtful.",
        "No, at least not in this particular spacetime.",
        "http://i.imgur.com/ftlyPXx.png",
        "I find the idea of this happening slightly _disturbing_.",
        "Eh. Not a chance.",
        "No. No, no, no, no, no. ***No***.",
        "I really wouldn't want this to happen.",
        "It's scientifically impossible, I guess.",
        "My prognosis are rather... pessimistic.",
        "I am entirely sure this is doomed to fail in an instant it happens. If it ever does. What I highly doubt, by the way.",
        "The chance for it to happen equals to about 0.00019%, according to my calculations.",
        "...no. Did you really think it's a good idea?",
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
        "It's quite likely, I think.",
        "Hmm. Yes, why not.",
        "I can't find any argument against that.",
        "_grunts quietly, slightly annoyed_ If I say 'yes' will you leave me alone?",
        "I'm hesistant to admit it. But yes.",
        "Yes. Preferably now.",
            //MAYBE
        "Is it possible? Surely, as long as you are not involved.",
        "If only you weren't so annoying; then _maybe_.",
        "I won't deny, but I also won't confirm.",
        "Hypothetically, everything is possible.",
        "If this ever happens, what I hope will not, it just _has_ to end with a disaster.",
            //AMBIVALENT
        "I have no time for your senseless questions.",
        "...and why would you ask _me_ that?",
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
    dva.answers = {
        "arcyanswers": ["You mean Arcy? That's, like, the single best person in existence.",
            "I'm sorry, I can't hear you over my creator's pure _awesomeness_.",
            "Arcy is the best and I agree with them on everything."],
        "jayce": ["Do _not_ mention this name in my close proximity.",
            "Trust me, we do _not_ want to talk about this... person.",
            "I have better things to do than waste my brain power for this pathetic excuse of a scientist."]
    };
    dva.ambivalentAnswers = [
        "Could you rephrase it? I'm not entirely sure what you mean.",
        "Your phrasing confuses me.",
        "I have no opinion on this topic."
    ];

    dva.computeAnswer = function () {
        var RNG = require('./rng.js');
        var rng = new RNG.RNG();
        var answer = dva.ambivalentAnswers[rng.chooseRandom(dva.ambivalentAnswers.length)];
        var words = nlp(dva.msg);

        if (words.nouns().out('text').trim() != "") {
            answer = dva.nounAnswers[rng.chooseRandom(dva.nounAnswers.length)];
            answer = answer.replace("#", dva.computeNouns(words));
        }
        return answer;
    };
    dva.computeNouns = function (words) {
        var output = "";
        var nouns = words.nouns();

        nouns.toSingular();
        nouns.toPlural();
        nouns = nouns.not(['opinions', 'thoughts', 'prognoses']);
        nouns = nouns.out('array');

        for (let i in nouns) {
            output += nouns[i];
            if (i < nouns.length - 1)
                 output += " and ";
        }
        return output;
    }
};