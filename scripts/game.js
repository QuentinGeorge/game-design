( function( Shinobi ) {
    "use strict";

    var oApp = {
            "canvas": null,
            "context": null,
            "width": null,
            "height": null
        },
        _isCanvasSupported;

    _isCanvasSupported = function( $canvasElt ) {
        return !!$canvasElt.getContext;
    };

    oApp.setup = function() {
        this.canvas = document.querySelector( "#game" );

        if ( !_isCanvasSupported( this.canvas ) ) {
            return console.error( "Canvas isn't supported!" );
        }

        this.context = this.canvas.getContext( "2d" );
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        window.game = new Shinobi( this );
    };

    oApp.setup();

    // Center game on click to help on mobile version if screen < body
    document.querySelector( ".container" ).onclick = function() {
        // Center the game verticaly on body if window >= 650px, if 650 > window > 550 on Canvas + audio controls, and on Canvas if window <= 550px
        var oPositions;

        if ( window.innerHeight >= 650 ) {
            oPositions = document.body.getBoundingClientRect();
        } else {
            oPositions = document.querySelector( ".container" ).getBoundingClientRect();
            if ( window.innerHeight <= 550 ) {
                oPositions = document.querySelector( "#game" ).getBoundingClientRect();
            }
        }
        window.scrollTo( 0, ( oPositions.top + window.pageYOffset - ( window.innerHeight / 2 ) + ( oPositions.height / 2 ) ) );
    };

    // Center the game with space-bar
    window.onkeydown = function( oEvent ) {
        // Center the game verticaly on body if window >= 650px, if 650 > window > 550 on Canvas + audio controls, and on Canvas if window <= 550px
        var oPositions;

        if ( window.innerHeight >= 650 ) {
            oPositions = document.body.getBoundingClientRect();
        } else {
            oPositions = document.querySelector( ".container" ).getBoundingClientRect();
            if ( window.innerHeight <= 550 ) {
                oPositions = document.querySelector( "#game" ).getBoundingClientRect();
            }
        }
        if ( oEvent.keyCode === 32 && oEvent.target === document.body ) {
            oEvent.preventDefault(); // Avoid the space-bar scroll down matter
            window.scrollTo( 0, ( oPositions.top + window.pageYOffset - ( window.innerHeight / 2 ) + ( oPositions.height / 2 ) ) );
        }
    };

} )( window.Shinobi );
