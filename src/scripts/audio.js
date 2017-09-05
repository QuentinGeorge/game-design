/** QuentinGeorge/game-design
***
*** /scripts/audio.js - Audio controllers
***
*** Coded by Quentin George
**/

let mAudioPlayer = document.getElementById( "player" ),
    mVolume = document.getElementById( "control-volume" ),
    mPlayPause = document.querySelector( ".pause-play" ),
    mMute = document.querySelector( ".volume__container" ),
    oIconPlay = document.querySelector( ".pause-play__icon--play" ),
    oIconPause = document.querySelector( ".pause-play__icon--pause" ),
    oIconVolumeMute = document.querySelector( ".volume__icon--mute" ),
    oIconVolumeLow = document.querySelector( ".volume__icon--low" ),
    oIconVolumeMedium = document.querySelector( ".volume__icon--medium" ),
    oIconVolumeHigh = document.querySelector( ".volume__icon--high" ),
    fModifiVolumeIcon,
    fStartAudioOnFirstGameStart,
    bFirstAudioStarted = false;

fModifiVolumeIcon = function( AudioPlayer, ButtonMute ) {
    if ( AudioPlayer.volume === 0 || AudioPlayer.muted === true ) {
        oIconVolumeMute.style.opacity = 1;
        oIconVolumeLow.style.opacity = 0;
        oIconVolumeMedium.style.opacity = 0;
        oIconVolumeHigh.style.opacity = 0;

        return;
    }
    if ( AudioPlayer.volume > 0 && AudioPlayer.volume <= 0.33 ) {
        oIconVolumeMute.style.opacity = 0;
        oIconVolumeLow.style.opacity = 1;
        oIconVolumeMedium.style.opacity = 0;
        oIconVolumeHigh.style.opacity = 0;

        return;
    }
    if ( AudioPlayer.volume > 0.33 && AudioPlayer.volume <= 0.66 ) {
        oIconVolumeMute.style.opacity = 0;
        oIconVolumeLow.style.opacity = 1;
        oIconVolumeMedium.style.opacity = 1;
        oIconVolumeHigh.style.opacity = 0;

        return;
    }
    if ( AudioPlayer.volume > 0.66 ) {
        oIconVolumeMute.style.opacity = 0;
        oIconVolumeLow.style.opacity = 1;
        oIconVolumeMedium.style.opacity = 1;
        oIconVolumeHigh.style.opacity = 1;

        return;
    }
};

fStartAudioOnFirstGameStart = function( oEvent ) {
    if ( ( oEvent.type === "mousedown" || ( oEvent.type === "keydown" && oEvent.keyCode === 32 ) ) && bFirstAudioStarted === false ) {
        mAudioPlayer.play();
        bFirstAudioStarted = true;
        oIconPlay.style.opacity = 0;
        oIconPause.style.opacity = 1;
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
        oIconPlay.style.opacity = 0;
        oIconPause.style.opacity = 1;
    } else {
        mAudioPlayer.pause();
        oIconPlay.style.opacity = 1;
        oIconPause.style.opacity = 0;
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
