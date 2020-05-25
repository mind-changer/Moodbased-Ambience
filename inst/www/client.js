//script.js is not used
//getEmotion.r is not used
// Check hash for token

// Check hash for token
const spotifyBaseUrl = 'https://api.spotify.com/v1/';

const hash = window.location.hash
.substring(1)
.split('&')
.reduce(function (initial, item) {
  if (item) {
    var parts = item.split('=');
    initial[parts[0]] = decodeURIComponent(parts[1]);
  }
  return initial;
}, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = 'e93a19ab18f44baabc3616be428877f8';
//const redirectUri = 'https://nelson.glitch.me/';
const redirectUri= 'http://localhost:5656/ocpu/library/MoodbasedAmbience/www/';
const scopes = [
  'streaming',
  //'user-read-birthdate',
  'user-read-email',
  'user-read-private',
  'playlist-modify-public',
  'user-read-playback-state',
  'user-modify-playback-state'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token`;
}

else {

  let deviceId;
  let playbackSetting;

  // Page setup
  genreLimitAlert("off");
  getGenresList();
  //setUpSliders();
  showUser();
  getDevices();
  //setPlaybackSetting(1);
}

// Initialise Web Playback SDK
function onSpotifyPlayerAPIReady() {

  let player = new Spotify.Player({
    name: 'Nelson',
    getOAuthToken: function(cb) {
      cb(_token);
    },
    volume: 0.8
  });

  player.on('ready', function(data) {
    deviceId = data.device_id;
    localStorage.setItem('nelsonBrowserDeviceID', data.device_id);
  });

  player.on('player_state_changed', function(data) {
    if(data) {
      let currentTrack = data.track_window.current_track.uri;
      updateCurrentlyPlaying(currentTrack);
    }
  });

  player.connect();
}

// Dark mode toggle
$('#darkmode-button').click(function() {
  $('body').toggleClass('darkmode');
  //$('p').css('color':'white');
});

function genreLimitAlert(state) {
  if(state == "on") {
    $('#genreLimitAlert').show();
  } else {
    $('#genreLimitAlert').hide();
  }
}

function showUser() {
  /*$.get('/user?token=' + _token, function(user) {
    $('#current-user').text(user.id);
  });*/
  $.ajax({
    url: 'https://api.spotify.com/v1/me',
    type: 'GET',
    headers: {
        'Authorization' : 'Bearer ' + _token
    },
    success: function(user) {
        //alert(user);
        $('#current-user').text(user.display_name);
    }
});
}

function logout() {
  _token = null;
  window.open('https://accounts.spotify.com/logout');
  location.reload();
}
/*
function setPlaybackSetting(setting) {
  playbackSetting = setting;

  if (setting == 0) {
    deviceId = null;
    pause();
    $('#current-playback').text('None');
  }

  if (setting == 1) {
    setDevice(localStorage.getItem('nelsonBrowserDeviceID'));
    $('#current-playback').text('In Browser');
  }

  if (setting == 2) {
    $('#device-select').modal('show');
  }
}

function setDevice(id, name) {
  deviceId = id;
  $('#current-playback').text(name);

  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/transfer/',
    type: 'PUT',
    headers: {
        'Authorization' : 'Bearer ' + _token
    },
    data: { "device_ids": [deviceId] },
    success: function(user) {

    }
});

  $.post('/transfer?device_id=' + deviceId + '&token=' + _token);
}
*/
function getDevices() {
  $('#devices-list').empty();

  $.ajax({
      url: 'https://api.spotify.com/v1/me/player/devices',
      type: 'GET',
      headers: {
          'Authorization' : 'Bearer ' + _token
      },
      success: function(devices) {
          Object.keys(devices).forEach(function(device) {
            device=devices[device];
      let deviceRadioElement = '<div class="radio" onclick="setDevice(\'' + device.id + '\',\'' + device.name + '\')"><label><input type="radio" name="device">' + device.name + '<span class="control-indicator"></span></label></div>';
      $('#devices-list').append(deviceRadioElement);
    });
      }
  });

}

function getGenresList() {
  $('#genres-list').empty();

  $.ajax({
    url: 'https://api.spotify.com/v1/recommendations/available-genre-seeds',
    type: 'GET',
    headers: {
        'Authorization' : 'Bearer ' + _token
    },
    success: function(genres) {

        Object.keys(genres).forEach(function(genre) {
          genre=genres[genre];
          genre.forEach(function(genre_name){
            console.log(genre_name);
      let genreButtonElement = '<label class="btn btn-salmon btn-sm"><input type="checkbox" value="' + genre_name + '">' + genre_name + '</label>';
      $('#genres-list').append(genreButtonElement);
          });

    });
    }
});

  $('#genres-list').on('change', 'input', function() {
    if($('#genres-list input:checked').length > 5) {
      $(this).parent().removeClass("active");
      this.checked = false;
      genreLimitAlert("on");
    }
    else {
      genreLimitAlert("off");
    }
  });
}

var genres=[];
var genresString="";
$('#okay-btn').click(function(){
   genres = [];
  $('#genres-list input:checked').each(function() {
    genres.push($(this).val());
  });
  genresString = genres.join();
  console.log(genresString);
  localStorage.setItem('currentNelsonGenres', genresString);
  $('#current-genres').text(genresString);
})


function getRecommend(EnergyValenceArr){
  //let limit = +$('#number-tracks').val();

  // Get selected genres
  /*let genres = [];
  $('#genres-list input:checked').each(function() {
    genres.push($(this).val());
  });
  let genresString = genres.join();
  console.log(genresString);
  localStorage.setItem('currentNelsonGenres', genresString);
  $('#current-genres').text(genresString);*/
  value={};
  limit=10;



  if(EnergyValenceArr[1]>0.5){
    console.log("0.5 to 1");
    value["min_valence"]=EnergyValenceArr[1];
    value["mode"]=1;
  }
  else{
    console.log("0 to 0.5");
    value["max_valence"]=EnergyValenceArr[1];
    value["mode"]=0;
  }


  if(EnergyValenceArr[0]==1){
    console.log("random number between 0 and 1");

  }
  else if(EnergyValenceArr[0]==-1){
    console.log("neutral");

  }
  else if(EnergyValenceArr[0]>=0.5){
    console.log("set minimum_energy to the value and max_energy to 1");
    value["min_energy"]=EnergyValenceArr[0];
    value["min_danceability"]=EnergyValenceArr[0];
    if(EnergyValenceArr[0]==0.5){
      value["min_tempo"]=115;
    }
    else{
      value["min_tempo"]=150;
    }
  }
  else{
    console.log("set minimum_energy to 0 and max energy to the value");
    value["max_energy"]=EnergyValenceArr[0];
    value["max_danceability"]=EnergyValenceArr[0];

  }

localStorage.setItem('currentNelsonFeatures', JSON.stringify(value));

$.ajax({
    url: 'https://api.spotify.com/v1/recommendations?limit=' + limit + '&seed_genres=' + localStorage.getItem('currentNelsonGenres') + '&' + $.param(value),
    type: 'GET',
    headers: {
        'Authorization' : 'Bearer ' + _token
    },
    dataType: 'JSON',
    success: function(data) {
         $('#tracks').empty();
    let firstId='';
    let trackIds = [];
    let trackUris = [];
    if(data.tracks) {
      if(data.tracks.length > 0) {

        data.tracks.forEach(function(track) {
          console.log(track.id);
          renderTracks(trackIds);
          window.open("https://open.spotify.com/track/"+track.id);
          trackIds.push(track.id);
          trackUris.push(track.uri);
        });
        localStorage.setItem('currentNelsonTracks', trackUris.join());

        play(trackUris.join());
      }
      else {
        $('#tracks').append('<h2>No results. Try a broader search.</h2>')
      }
    }
    else {
      $('#tracks').append('<h2>No results. Select some genres first.</h2>')
    }
    }
});

  $.get('/recommendations?limit=' + limit  + '&' + $.param(value) + '&token=' + _token, function(data) {
    $('#tracks').empty();
    let firstId='';
    let trackIds = [];
    let trackUris = [];
    if(data.tracks) {
      if(data.tracks.length > 0) {

        data.tracks.forEach(function(track) {
          console.log(track.id);
          window.location="https://open.spotify.com/track/"+track.id;
          trackIds.push(track.id);
          trackUris.push(track.uri);
        });
        localStorage.setItem('currentNelsonTracks', trackUris.join());
        renderTracks(trackIds);
        play(trackUris.join());
      }
      else {
        $('#tracks').append('<h2>No results. Try a broader search.</h2>')
      }
    }
    else {
      $('#tracks').append('<h2>No results. Select some genres first.</h2>')
    }
  });

}

function renderTracks(ids) {

  $.ajax({
      url: spotifyBaseUrl + 'tracks/?ids='+ ids.join()+'&market=from_token',
      type: 'GET',
      headers: {
          'Authorization' : 'Bearer ' + _token
      },
      success: function(tracks) {
          //alert(user);
          Object.keys(tracks).forEach(function(track) {
            track=tracks[track];
            track.forEach(function(track){
              let image = track.album.images ? track.album.images[0].url : 'https://upload.wikimedia.org/wikipedia/commons/3/3c/No-album-art.png';
      let trackElement = '<div class="track-element" id="' + track.uri + '" onclick="play(\'' + track.uri + '\');"><div><img height= 100px width=100px class="album-art" src="' + image + '"/><div><a href="https://open.spotify.com/track/' + track.id + '">' + track.name + '</a><p>' + track.artists[0].name + '</p></div></div><img class="remove-icon" src="https://cdn.glitch.com/9641d2b3-59eb-408e-ab02-0b9bbd49b069%2Fremove-icon.png?1508341583541" onclick="remove(\'' + track.uri + '\');"/></div>';
      $('#tracks').append(trackElement);
            });

    })
      }
  });


}

function updateCurrentlyPlaying(track) {
  $('.track-element').removeClass('current-track');
  if(document.getElementById(track)) {
    document.getElementById(track).className += " current-track";
  }
}

function makePlaylist() {


  if(localStorage.getItem('currentNelsonTracks')) {

    $.ajax({
    url: 'https://api.spotify.com/v1/me',
    type: 'GET',
    headers: {
        'Authorization' : 'Bearer ' + _token
    },
    success: function(user) {
        $.ajax({
          /*url: 'https://api.spotify.com/v1/users/'+user.id+'/playlists',
          type: 'POST',
          headers: {
              'Authorization' : 'Bearer ' + _token,
              'Content-Type': 'application/json',
              'Accept' : 'application/json'
          },
          data: {
            "name": "yourPersonalisedMix",
            "public": true
          },*/
          url: 'https://api.spotify.com/v1/users/'+user.id+'/playlists',
          type: 'GET',
          headers: {
              'Authorization' : 'Bearer ' + _token
          },
          success: function(playlists) {
            let flag=1
            //Object.keys(playlists).forEach(function(playlist));
            console.log(playlists.items[0].name);
            playlists.items.forEach(function(item){
              if(item.name=="yourPersonalisedMix"){
                //update current playlist
                flag=1
              }
              else{
                //create new playlist
                flag=2

              }

            });
            if(flag==2){
              $.ajax({
                  url: "https://api.spotify.com/v1/users/"+user.id+"/playlists",
                  type: "POST",
                  headers: {
                    "Authorization": "Bearer "+ _token,


                  },
                  contentType: "application/json",
                  accept: "application/json",
                  dataType: "JSON",
                  data: JSON.stringify({
                    "name": "yourPersonalisedMix",
                    "public": true
                    }),
                  success: function(output){
                    alert("playlist successfully made");
                  }
                });
            }
            else{
              //update playlist

            }
          }
        });
    }
});

    /*$.post('/playlist?tracks=' + localStorage.getItem('currentNelsonTracks') + '&genres=' + localStorage.getItem('currentNelsonGenres')+ '&features=' + localStorage.getItem('currentNelsonFeatures') + '&token=' + _token);*/

    $('#notice').html('<div class="alert alert-success alert-dismissable" role="alert"><b>Sweet!</b> You just created a new Spotify playlist with recommendations from us.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
  }
}



function remove(track) {
  let trackList = localStorage.getItem('currentNelsonTracks').split(',');
  trackList = trackList.filter(item => item != track);
  localStorage.setItem('currentNelsonTracks', trackList.join());
  let elementId = '#' + track;
  var element = document.getElementById(track);
  element.outerHTML = "";
  delete element;
}


$('#genre-beta-on').click(genreGroupsBeta);
$('#genre-beta-off').click(getGenresList);

function genreGroupsBeta() {
  $('#genres-list').empty();

  let genreGroupButtonElement = '<label class="btn btn-salmon btn-sm"><input type="checkbox" value="pop,happy,road-trip,power-pop">Happy Pop</label>';
  $('#genres-list').append(genreGroupButtonElement);
  genreGroupButtonElement = '<label class="btn btn-salmon btn-sm"><input type="checkbox" value="rock,hard-rock,punk-rock,alt-rock,rock-n-roll">Rock</label>';
  $('#genres-list').append(genreGroupButtonElement);
  genreGroupButtonElement = '<label class="btn btn-salmon btn-sm"><input type="checkbox" value="dance,edm,dubstep,house">Dance/EDM</label>';
  $('#genres-list').append(genreGroupButtonElement);
}


////////////////////////////from SCRIPT.JS//////////////////////////////////////

try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
}
catch (e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);



/*-----------------------------
      Voice Recognition
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = true;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function (event) {

    // event is a SpeechRecognitionEvent object.
    // It holds all the lines we have captured so far.
    // We only need the current one.
    var current = event.resultIndex;

    // Get a transcript of what was said.
    var transcript = event.results[current][0].transcript;

    // Add the current transcript to the contents of our Note.
    // There is a weird bug on mobile, where everything is repeated twice.
    // There is no official solution so far so we have to handle an edge case.
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

    if (!mobileRepeatBug) {
        noteContent += transcript;
        noteTextarea.val(noteContent);
    }
};

recognition.onstart = function () {
    instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function () {
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function (event) {
    if (event.error == 'no-speech') {
        instructions.text('No speech was detected. Try again.');
    }
}



/*-----------------------------
      App buttons and input
------------------------------*/

$('#start-record-btn').on('click', function (e) {
    if (noteContent.length) {
        noteContent += ' ';
    }
    recognition.start();
});


$('#pause-record-btn').on('click', function (e) {
    recognition.stop();
    instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function () {
    noteContent = $(this).val();
})

$('#save-note-btn').on('click', function (e) {
    recognition.stop();

    if (!noteContent.length) {
        instructions.text('Could not save empty note. Please add a message to your note.');
    }
    else {
        // Save note to localStorage.
        // The key is the dateTime with seconds, the value is the content of the note.
        saveNote(new Date().toLocaleString(), noteContent);
        inputText=noteContent;
        if(true){
            var req = ocpu.rpc("sentAnalysis", {

            inputText : inputText

          }, function(output){

            //$("#output").text(output.message);
            getRecommend(output);
            //alert(output);

          });

          //if R returns an error, alert the error message
          req.fail(function(){

            alert("Server error: " + req.responseText);

          });

          //AVCDDSKJFHSDKJF

          //after request complete, re-enable the button
          /*req.always(function(){
            $("#submitbutton").removeAttr("disabled")
          });*/

        }


        // Reset variables and update UI.
        noteContent = '';
        renderNotes(getAllNotes());
        noteTextarea.val('');
        instructions.text('Note saved successfully.');
    }
    setTimeout(function(){

      var e = document.getElementById("tracks");
            e.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
                inline: 'center'
            });
    }, 5000);


});




notesList.on('click', function (e) {
    e.preventDefault();
    var target = $(e.target);

    // Listen to the selected note.
    if (target.hasClass('listen-note')) {
        var content = target.closest('.note').find('.content').text();
        readOutLoud(content);
    }

    // Delete note.
    if (target.hasClass('delete-note')) {
        var dateTime = target.siblings('.date').text();
        deleteNote(dateTime);
        target.closest('.note').remove();
    }
});



/*-----------------------------
      Speech Synthesis
------------------------------*/

function readOutLoud(message) {
    var speech = new SpeechSynthesisUtterance();

    // Set the text and voice attributes.
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}



/*-----------------------------
      Helper Functions
------------------------------*/

function renderNotes(notes) {
    var html = '';
    if (notes.length) {
        notes.forEach(function (note) {
            html += `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;
        });
    }
    else {
        html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
    }
    notesList.html(html);
}


function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
        key = localStorage.key(i);

        if (key.substring(0, 5) == 'note-') {
            notes.push({
                date: key.replace('note-', ''),
                content: localStorage.getItem(localStorage.key(i))
            });
        }
    }
    return notes;
}


function deleteNote(dateTime) {
    localStorage.removeItem('note-' + dateTime);
}



/*var inputText="";
var inputTextArray=[];
inputTextArray=getAllNotes();
var l=inputTextArray.length;
inputText=inputTextArray[0];
inputText=inputText.content;
console.log(inputText);
*/

//perform the request





