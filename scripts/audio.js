( function() {
    "use strict";

    var mAudioPlayer = document.getElementById( "player" ),
        mPlayPause = document.getElementById( "control-play-pause" ),
        mMute = document.getElementById( "control-mute" ),
        mVolume = document.getElementById( "control-volume" ),
        fModifiVolumeIcon;

    fModifiVolumeIcon = function( mAudioPlayer, mMute ) {
        if ( mAudioPlayer.volume === 0 ) {
            mMute.style.backgroundImage = "url('./resources/img/soundsSvg/volume-mute.svg')";
            return;
        }
        if ( mAudioPlayer.volume > 0 && mAudioPlayer.volume <= 0.33 ) {
            mMute.style.backgroundImage = "url('./resources/img/soundsSvg/volume-low.svg')";
            return;
        }
        if ( mAudioPlayer.volume > 0.33 && mAudioPlayer.volume <= 0.66 ) {
            mMute.style.backgroundImage = "url('./resources/img/soundsSvg/volume-medium.svg')";
            return;
        }
        if ( mAudioPlayer.volume > 0.66 ) {
            mMute.style.backgroundImage = "url('./resources/img/soundsSvg/volume-high.svg')";
            return;
        }
    };

    // set images faster when page is loaded and music player not yet
    mPlayPause.style.backgroundImage = "url('./resources/img/soundsSvg/play.svg')";
    mMute.style.backgroundImage = "url('./resources/img/soundsSvg/volume-medium.svg')";

    mAudioPlayer.oncanplay = function() {
        mAudioPlayer.volume = mVolume.value;
        fModifiVolumeIcon( mAudioPlayer, mMute );

        mPlayPause.onclick = function() {
            mPlayPause.blur();
            if ( mAudioPlayer.paused === true ) {
                mAudioPlayer.play();
                mPlayPause.style.backgroundImage = "url('./resources/img/soundsSvg/pause.svg')";
            } else {
                mAudioPlayer.pause();
                mPlayPause.style.backgroundImage = "url('./resources/img/soundsSvg/play.svg')";
            }
        };

        mMute.onclick = function() {
            mMute.blur();
            if ( mAudioPlayer.muted === true ) {
                mAudioPlayer.muted = false;
                fModifiVolumeIcon( mAudioPlayer, mMute );
            } else {
                mAudioPlayer.muted = true;
                mMute.style.backgroundImage = "url('./resources/img/soundsSvg/volume-mute.svg')";
            }
        };

        mVolume.onclick = function() {
            mVolume.blur();
            mAudioPlayer.muted = false;
            fModifiVolumeIcon( mAudioPlayer, mMute );
        };

        mVolume.oninput = function() {
            mVolume.blur();
            mAudioPlayer.muted = false;
            mAudioPlayer.volume = mVolume.value;
            fModifiVolumeIcon( mAudioPlayer, mMute );
        };
    };

} )();
