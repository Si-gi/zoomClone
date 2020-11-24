const socket = io()
myPeer = new Peer({host:'zeaeazpeerjs-server.herokuapp.com', secure:true, port:443})
myPeer.on('error', function (err) {
  //alert('an error has happened:', err)
  console.log(err.type)
})
/*const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})*/
var myUserId = "";
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
var sharing = false;

  
// MEDIA SELECTIONS
const videoGrid = document.getElementById('video-grid')
var outputDevices = [];
var medias = [];
const select_outPut = document.getElementById("outPutce_devices");
navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
  devices.forEach(function(device) {
    if(device.kind == "audiooutput" ){
      let option = document.createElement('option');
      option.text = device.label;
      option.value = device.deviceId;
      select_outPut.options.add(option);
      ///select_outPut.append(option);
      outputDevices.push({"label": device.label, "id" : device.deviceId})
    }
    console.log(device.kind + ": " + device.label +
                " id = " + device.deviceId);
  });
})



// END MEDIA SELECTIONS

//const myScreen = document.createElement('video');
//myScreen.muted = true;
window.onload = function() {
  $('#myModal').modal('show');
};
$('#myModal').on('hidden.bs.modal', function (e) {
  //do something
  console.log("fini");
})
function user(){
  $('#myModal').modal('hide')
  var username = $("#my_username").val();
  console.log(username);
}
const myVideo = document.createElement('video');

//myVideo.muted = true
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then(stream => {
  navigator.mediaDevices.getUserMedia({video: true, audio : false})
    .then(myStream => {
        addCamStream(myVideo, myStream);
      }
    );
  
  myVideo.setAttribute("muted","true");
  myVideo.muted = true
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video')
    video.setAttribute("controls", "");
    call.on('stream', userVideoStream => {
      addCamStream(video, userVideoStream)
    })
  })
  
  socket.on('user-connected', (userId) => {
    myUserId = userId; //FIXME:
    console.log("User Connected " + userId)
    connectToNewUser(userId, stream)

  });
  // input value
  let text = $("#chat_message");
  // when press enter send message
  $("html").keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      var username = $("#my_username").val();
      socket.emit("message", text.val(), username);
      text.val("");
    }
  });
  socket.on("createMessage", (message, username) => {
    $("ul").append(`<li class="message"><b>${username}</b><br/>${message}</li>`);
    scrollToBottom();
  });

  const muteUnmute = () => {
    console.log("mute or unmute")
    const enabled = stream.getAudioTracks()[0].enabled;
    if (enabled) {
      stream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      stream.getAudioTracks()[0].enabled = true;
    }
  };

  $('#toggleMute').on('click', function () {
    console.log("mute or unmute")
    const enabled = stream.getAudioTracks()[0].enabled;
    if (enabled) {
      stream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      stream.getAudioTracks()[0].enabled = true;
    }
  });
});

  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
  
  })


function addCamStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  video.setAttribute("controls", "");
  video.setAttribute("id",userId);
  call.on('stream', userVideoStream => {
    addCamStream(video, userVideoStream)
  })
  
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}


async function screenCapture() {
  if(!sharing){
    sharing = true;
    let displayMediaOptions = {
      video: {
        cursor: "always"
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    };
    const screenElem = document.getElementById('screen-shared');
    
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      //mySound = navigator.mediaDevices.getUserMedia(idDevice);
      let myVideo = document.createElement('video');
      myVideo.id ="myScreenCapture"
      myVideo.srcObject = captureStream ;
      myVideo.setAttribute("controls", "");
      myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play()
      })
      screenElem.append(myVideo);
      //myPeer.call(myUserId, mySound);
      myPeer.call(myUserId, captureStream);  
      document.getElementById("screen-text").textContent="stop share";
    } catch(err) {
      console.log(err);
    }
  }else{
    
    myScreen = document.getElementById("myScreenCapture");
    let tracks = myScreen.srcObject.getTracks();

    tracks.forEach(track => track.stop());
    myScreen.srcObject = null;
    myScreen.remove();
    document.getElementById("screen-text").textContent="Screen share";
    sharing = false;
  }
}    


const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};



const playStop = () => {
  console.log("object");
  let enabled = myVideo.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideo.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideo.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const exit = () => {
  window.location.href = "https://google.com";
};

// const copyInfo = () => {
//   navigator.clipboard.writeText(window.location.href);
// };


const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

function stopCapture(evt) {
  let tracks = screenElem.srcObject.getTracks();

  tracks.forEach(track => track.stop());
  screenElem.srcObject = null;
}