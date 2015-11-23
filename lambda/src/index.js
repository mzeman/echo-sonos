'use strict';

var http = require('http');

var options = require('./options');
var optionsh = require('./optionsh');

var AlexaSkill = require('./AlexaSkill');
var EchoSonos = function () {
    AlexaSkill.call(this, options.appid);
};

var SKIP_RESPONSES = [
    generateResponseTemplate("Skipping $currentArtist $currentTitle", true, false),
    generateResponseTemplate("Not a fan of $currentArtist?  Alright, we can skip them.", false, false),
    generateResponseTemplate("Don't like $currentTitle?  Skipping it.", false, false),
    generateResponseTemplate("No $currentArtist for you?  How about $nextArtist $nextTitle instead?", false, true)
];

var STATE_RESPONSES = [
    generateResponseTemplate("This is $currentArtist $currentTitle", true, false),
    generateResponseTemplate("We're listening to $currentTitle by $currentArtist", false, false),
    generateResponseTemplate("$currentTitle by $currentArtist", false, false)
];

EchoSonos.prototype = Object.create(AlexaSkill.prototype);
EchoSonos.prototype.constructor = EchoSonos;

EchoSonos.prototype.intentHandlers = {
    // register custom intent handlers
    PlayIntent: function (intent, session, response) {
        console.log("PlayIntent received");
        options.path = '/preset/'+encodeURIComponent(intent.slots.Preset.value.toLowerCase());
        httpreq(options, response, "Playing " + intent.slots.Preset.value);
    },
    PlayLikeIntent: function (intent, session, response) {
        console.log("PlayLikeIntent received");
        optionsh.path = '/like/play/'+encodeURIComponent(intent.slots.Room.value)+'/'+encodeURIComponent(intent.slots.Music.value);
        httpreq(optionsh, response, "Playing " + intent.slots.Music.value);
    },
    EnqueueLikeIntent: function (intent, session, response) {
        console.log("EnqueueLikeIntent received");
        optionsh.path = '/like/enqueue/'+encodeURIComponent(intent.slots.Room.value)+'/'+encodeURIComponent(intent.slots.Music.value);
        httpreq(optionsh, response, "Enqueue " + intent.slots.Music.value);
    },
    PlayArtistLikeIntent: function (intent, session, response) {
        console.log("PlayArtistLikeIntent received");
        optionsh.path = '/likeArtist/play/'+encodeURIComponent(intent.slots.Room.value)+'/'+encodeURIComponent(intent.slots.Artist.value);
        httpreq(optionsh, response, "Playing " + intent.slots.Artist.value);
    },
    PandoraPlayIntent: function (intent, session, response) {
        console.log("PandoraPlayIntent received");
        optionsh.path = '/pandora/play/'+encodeURIComponent(intent.slots.Room.value)+'/'+encodeURIComponent(intent.slots.Artist.value);
        httpreq(optionsh, response, "Playing Pandora Radio for query " + intent.slots.Artist.value);
    },
    SongzaPlayIntent: function (intent, session, response) {
        console.log("SongzaPlayIntent received");
        optionsh.path = '/songza/play/'+encodeURIComponent(intent.slots.Room.value)+'/'+encodeURIComponent(intent.slots.Artist.value);
        httpreq(optionsh, response, "Playing Songza Radio for query " + intent.slots.Artist.value);
    },
    RadioPlayIntent: function (intent, session, response) {
        console.log("RadioPlayIntent received");
        optionsh.path = '/'+encodeURIComponent(intent.slots.RadioType.value)+'/play/'+encodeURIComponent(intent.slots.Room.value)+'/'+encodeURIComponent(intent.slots.Artist.value);
        httpreq(optionsh, response, "Playing " + intent.slots.RadioType.value + " radio for query " + intent.slots.Artist.value);
    },
    EnqueueArtistLikeIntent: function (intent, session, response) {
        console.log("EnqueueArtistLikeIntent received");
        optionsh.path = '/likeArtist/enqueue/'+encodeURIComponent(intent.slots.Room.value)+'/'+encodeURIComponent(intent.slots.Artist.value);
        httpreq(optionsh, response, "Enqueue " + intent.slots.Artist.value);
    },
    GroupIntent: function (intent, session, response) {
        console.log("GroupIntent received");
        optionsh.path = '/join/'+encodeURIComponent(intent.slots.RoomA.value)+'/'+encodeURIComponent(intent.slots.RoomB.value);
        httpreq(optionsh, response, "Joining " + intent.slots.RoomA.value + " and " + intent.slots.RoomB.value);
    },
    UnGroupIntent: function (intent, session, response) {
        console.log("UnGroupIntent received");
        optionsh.path = '/unjoin/'+encodeURIComponent(intent.slots.Room.value);
        httpreq(optionsh, response, "Un Joining " + intent.slots.Room.value);
    },
    NextTrackIntent: function (intent, session, response) {
        console.log("NextTrackIntent received");
        skipHttpreq(optionsh, intent.slots.Room.value, response);
    },
    PreviousTrackIntent: function (intent, session, response) {
        console.log("PreviousTrackIntent received");
        optionsh.path = '/previous/'+encodeURIComponent(intent.slots.Room.value);
        httpreq(optionsh, response, "Previous Track in " + intent.slots.Room.value);
    },
    WhatsPlayingIntent: function (intent, session, response) {
        console.log("WhatsPlayingIntent received");
        optionsh.path = '/state/'+encodeURIComponent(intent.slots.Room.value);
        stateHttpreq(optionsh, response);
    },
    PauseIntent: function (intent, session, response) {
        console.log("PauseIntent received");
        optionsh.path = '/pause/'+encodeURIComponent(intent.slots.Room.value);
        httpreq(optionsh, response, "Pausing " + intent.slots.Room.value);
    },
    ResumeIntent: function (intent, session, response) {
        console.log("ResumeIntent received");
        optionsh.path = '/play/'+encodeURIComponent(intent.slots.Room.value);
        httpreq(optionsh, response, "Playing " + intent.slots.Room.value);
    },

    SayIntent: function (intent, session, response) {
        console.log("SayIntent received");
        options.path = '/'+encodeURIComponent(intent.slots.Room.value)+'/say/'+encodeURIComponent(intent.slots.Say.value);
        httpreq(options, response, "Saying " + intent.slots.Say.value);
    },
    VolumeSetIntent: function (intent, session, response) {
        console.log("VolumeSetIntent received");
        options.path = '/groupVolume/'+encodeURIComponent(intent.slots.Room.value)+'/=/'+encodeURIComponent(intent.slots.Volume.value);
        httpreq(options, response, "OK");
    },
    VolumeUpIntent: function (intent, session, response) {
        console.log("VolumeUpIntent received");
        options.path = '/groupVolume/'+encodeURIComponent(intent.slots.Room.value)+'/+/'+encodeURIComponent(intent.slots.Volume.value);
        httpreq(options, response, "OK");
    },
    VolumeDownIntent: function (intent, session, response) {
        console.log("VolumeDownIntent received");
        options.path = '/groupVolume/'+encodeURIComponent(intent.slots.Room.value)+'/-/'+encodeURIComponent(intent.slots.Volume.value);
        httpreq(options, response, "OK");
    }
    VolumeSetSpecificIntent: function (intent, session, response) {
        console.log("VolumeSetSpecificIntent received");
        options.path = '/volume/'+encodeURIComponent(intent.slots.Room.value)+'/=/'+encodeURIComponent(intent.slots.Volume.value);
        httpreq(options, response, "OK");
    },
    VolumeSpecificUpIntent: function (intent, session, response) {
        console.log("VolumeUpSpecificIntent received");
        options.path = '/volume/'+encodeURIComponent(intent.slots.Room.value)+'/+/'+encodeURIComponent(intent.slots.Volume.value);
        httpreq(options, response, "OK");
    },
    VolumeDownSpecificIntent: function (intent, session, response) {
        console.log("VolumeDownSpecificIntent received");
        options.path = '/volume/'+encodeURIComponent(intent.slots.Room.value)+'/-/'+encodeURIComponent(intent.slots.Volume.value);
        httpreq(options, response, "OK");
    }
//    PauseIntent: function (intent, session, response) {
//        console.log("PauseIntent received");
//        options.path = '/pauseall';
//        httpreq(options, response, "Pausing");
//    },
//    ResumeIntent: function (intent, session, response) {
//        console.log("ResumeIntent received");
//        options.path = '/resumeall';
//        httpreq(options, response, "Resuming");
//    },
//    VolumeDownIntent: function (intent, session, response) {
//        console.log("VolumeDownIntent received");
//        options.path = '/groupVolume/-10';
//        httpreq(options, response, "OK");
//    },
//    VolumeUpIntent: function (intent, session, response) {
//        console.log("VolumeUpIntent received");
//        options.path = '/groupVolume/+10';
//        httpreq(options, response, "OK");
//    }
//    NextTrackIntent: function (intent, session, response) {
//        console.log("NextTrackIntent received");
//        skipHttpreq(options, response);
//    },
//    PreviousTrackIntent: function (intent, session, response) {
//        console.log("PreviousTrackIntent received");
//        options.path = '/previous';
//        httpreq(options, response, "OK");
//    },
//    WhatsPlayingIntent: function (intent, session, response) {
//        console.log("WhatsPlayingIntent received");
//        options.path = '/state';
//        stateHttpreq(options, response);
//    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the EchoSonos skill.
    var echoSonos = new EchoSonos();
    echoSonos.execute(event, context);
};

function httpreq(options, alexaResponse, responseText) {
  //console.log("Trying http request with responseText " + responseText);
  http.request(options, function(httpResponse) {
    //console.log(httpResponse);
    if (responseText) {
        alexaResponse.tell(responseText);
    }
  }).end();
}

function stateHttpreq(options, alexaResponse) {
    http.request(options, function(httpResponse) {
        var body = '';
        httpResponse.on('data', function(data) {
            body += data;
        });
        httpResponse.on('end', function() {
            var currentState = JSON.parse(body);
            console.log("response: " + body)
            if (currentState.currentTrack) {
                alexaResponse.tell(generateRandomResponse(STATE_RESPONSES, currentState));
            }
        });
  }).end();
}

function skipHttpreq(options, room, alexaResponse) {
    options.path = '/state/'+encodeURIComponent(room);
    http.request(options, function(httpResponse) {
        var body = '';
        httpResponse.on('data', function(data) {
            body += data;
        });
        httpResponse.on('end', function() {
            var currentState = JSON.parse(body);
            console.log("response1: " + body)
            options.path = '/next/'+encodeURIComponent(room);
            http.request(options, function(httpResponse2) {
                console.log("response2: " + httpResponse2)
                if (currentState.currentTrack) {
                    alexaResponse.tell(generateRandomResponse(SKIP_RESPONSES, currentState));
                }
            }).end();
        });
  }).end();
}

function generateRandomResponse(responseTemplates, currentState) {
    var index = parseInt(Math.random() * responseTemplates.length, 10);
    return generateResponse(responseTemplates[index], currentState);
}

function generateResponse(responseTemplate, currentState) {
    var currentArtist = currentState.currentTrack.artist;
    if (responseTemplate.possessiveCurrentArtist) {
        currentArtist = makePossessive(currentArtist);
    }
    var nextArtist = currentState.nextTrack.artist;
    if (responseTemplate.possessiveNextArtist) {
        nextArtist = makePossessive(nextArtist);
    }
    var response = responseTemplate.template.
        replace("$currentArtist", currentArtist).
        replace("$currentTitle", currentState.currentTrack.title).
        replace("$nextArtist", nextArtist).
        replace("$nextTitle", currentState.nextTrack.title);
    console.log("Generated response: " + response);
    return response;
}

function makePossessive(name) {
    if (name.toLowerCase().charAt(name.length - 1) === 's') {
        return name + "'";
    }
    return name + "'s";
}

function generateResponseTemplate(template, possessiveCurrentArtist, possessiveNextArtist) {
    return {
        template: template,
        possessiveCurrentArtist: possessiveCurrentArtist,
        possessiveNextArtist: possessiveNextArtist
    }
}
