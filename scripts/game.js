( function( Shinobi ) {
    "use strict";

    var oApp = {
            "canvas": null,
            "context": null,
            "width": null,
            "height": null
        },
        _isCanvasSupported,
        mContainer = document.querySelector( ".container" ),
        mCanvas = document.querySelector( "#game" );

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

    // Center game on click to help on mobile version
    mCanvas.onclick = function() {
        // Center the game verticaly on body if window > body.height, on Canvas + audio controls if body.height > window > container.height, and on Canvas if window <= container.height
        var oPositions;

        if ( window.innerHeight > document.body.clientHeight ) {
            oPositions = document.body.getBoundingClientRect();
        } else {
            oPositions = mContainer.getBoundingClientRect();
            if ( window.innerHeight <= mContainer.clientHeight ) {
                oPositions = mCanvas.getBoundingClientRect();
            }
        }
        window.scrollTo( 0, ( oPositions.top + window.pageYOffset - ( window.innerHeight / 2 ) + ( oPositions.height / 2 ) ) );
    };

    // Center the game with space-bar
    window.onkeydown = function( oEvent ) {
        // Center the game verticaly on body if window > body.height, on Canvas + audio controls if body.height > window > container.height, and on Canvas if window <= container.height
        var oPositions;

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
            window.scrollTo( 0, ( oPositions.top + window.pageYOffset - ( window.innerHeight / 2 ) + ( oPositions.height / 2 ) ) );
        }
    };

} )( window.Shinobi );
