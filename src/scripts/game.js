/** QuentinGeorge/game-design
***
*** /scripts/game.js - Game canvas init
***
*** Coded by Quentin George
**/

let oApp = {
        "canvas": null,
        "context": null,
        "width": null,
        "height": null,
    },
    mContainer = document.querySelector( ".container" ),
    mCanvas = document.querySelector( "#game" );

const setup = function() {
    oApp.canvas = document.querySelector( "#game" );
    if ( !oApp.canvas.getContext ) {
        console.error( "Your browser doesn't support canvas!" );

        return;
    }
    oApp.context = oApp.canvas.getContext( "2d" );
    oApp.width = oApp.canvas.width;
    oApp.height = oApp.canvas.height;
// eslint-disable-next-line
    new Shinobi( oApp );
};

// eslint-disable-next-line
setup();

// Center game on click to help on mobile version
mCanvas.onclick = function() {
    // Center the game verticaly on body if window > body.height, on Canvas + audio controls if body.height > window > container.height, and on Canvas if window <= container.height
    let oPositions;

    if ( window.innerHeight > document.body.clientHeight ) {
        oPositions = document.body.getBoundingClientRect();
    } else {
        oPositions = mContainer.getBoundingClientRect();
        if ( window.innerHeight <= mContainer.clientHeight ) {
            oPositions = mCanvas.getBoundingClientRect();
        }
    }
    window.scrollTo( 0, oPositions.top + window.pageYOffset - ( window.innerHeight / 2 ) + ( oPositions.height / 2 ) );
};

// Center the game with space-bar
window.onkeydown = function( oEvent ) {
    // Center the game verticaly on body if window > body.height, on Canvas + audio controls if body.height > window > container.height, and on Canvas if window <= container.height
    let oPositions;

    if ( window.innerHeight > document.body.clientHeight ) {
        oPositions = document.body.getBoundingClientRect();
    } else {
        oPositions = mContainer.getBoundingClientRect();
        if ( window.innerHeight <= mContainer.clientHeight ) {
            oPositions = mCanvas.getBoundingClientRect();
        }
    }
    if ( oEvent.keyCode === 32 && oEvent.target === document.body ) {
        oEvent.preventDefault(); // Avoid the space-bar scroll down matter
        window.scrollTo( 0, oPositions.top + window.pageYOffset - ( window.innerHeight / 2 ) + ( oPositions.height / 2 ) );
    }
};
