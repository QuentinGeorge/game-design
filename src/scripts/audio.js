/** QuentinGeorge/game-design
***
*** /scripts/audio.js - Audio controllers
***
*** Coded by Quentin George
**/

let mAudioPlayer = document.getElementById( "player" ),
    mPlayPause = document.getElementById( "control-play-pause" ),
    mMute = document.getElementById( "control-mute" ),
    mVolume = document.getElementById( "control-volume" ),
    fModifiVolumeIcon,
    fStartAudioOnFirstGameStart,
    bFirstAudioStarted = false;

fModifiVolumeIcon = function( AudioPlayer, ButtonMute ) {
    if ( AudioPlayer.volume === 0 || AudioPlayer.muted === true ) {
        ButtonMute.style.backgroundImage = "url('./assets/img/soundsSvg/volume-mute.svg')";

        return;
    }
    if ( AudioPlayer.volume > 0 && AudioPlayer.volume <= 0.33 ) {
        ButtonMute.style.backgroundImage = "url('./assets/img/soundsSvg/volume-low.svg')";

        return;
    }
    if ( AudioPlayer.volume > 0.33 && AudioPlayer.volume <= 0.66 ) {
        ButtonMute.style.backgroundImage = "url('./assets/img/soundsSvg/volume-medium.svg')";

        return;
    }
    if ( AudioPlayer.volume > 0.66 ) {
        ButtonMute.style.backgroundImage = "url('./assets/img/soundsSvg/volume-high.svg')";

        return;
    }
};

fStartAudioOnFirstGameStart = function( oEvent ) {
    if ( ( oEvent.type === "mousedown" || ( oEvent.type === "keydown" && oEvent.keyCode === 32 ) ) && bFirstAudioStarted === false ) {
        mAudioPlayer.play();
        bFirstAudioStarted = true;
        mPlayPause.style.backgroundImage = "url('./assets/img/soundsSvg/pause.svg')";
    }
};

// Start Audio on the first starting game
document.querySelector( "#game" ).addEventListener( "mousedown", fStartAudioOnFirstGameStart, false );
window.addEventListener( "keydown", fStartAudioOnFirstGameStart, false );

// Display audio controls
mAudioPlayer.volume = mVolume.value;
fModifiVolumeIcon( mAudioPlayer, mMute );

mPlayPause.onclick = function() {
    mPlayPause.blur();
    if ( mAudioPlayer.paused === true ) {
        mAudioPlayer.play();
        bFirstAudioStarted = true;
        mPlayPause.style.backgroundImage = "url('./assets/img/soundsSvg/pause.svg')";
    } else {
        mAudioPlayer.pause();
        mPlayPause.style.backgroundImage = "url('./assets/img/soundsSvg/play.svg')";
    }
};

mMute.onclick = function() {
    mMute.blur();
    if ( mAudioPlayer.muted === true ) {
        mAudioPlayer.muted = false;
    } else {
        mAudioPlayer.muted = true;
    }
    fModifiVolumeIcon( mAudioPlayer, mMute );
};

mVolume.onclick = function() {
    mVolume.blur();
    mAudioPlayer.muted = false;
    fModifiVolumeIcon( mAudioPlayer, mMute );
};

mVolume.oninput = function() {
    mAudioPlayer.muted = false;
    mAudioPlayer.volume = mVolume.value;
    fModifiVolumeIcon( mAudioPlayer, mMute );
};
