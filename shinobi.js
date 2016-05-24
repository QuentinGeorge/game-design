( function() {

    "use strict";

    var Shinobi;

    // Game Manager

    Shinobi = function( oApp ) {

        var game = this,
            SmallWalls,
            iLives,
            aGroundDx = [],
            aHeadDx = [];

        this.app = oApp;

        this.time = {
            "start": null,
            "current": null
        };

        // Starting Screen
        this.starting = {
            "frames": {
                "ready": {
                    "sx": 334,
                    "sy": 415,
                    "sw": 295,
                    "sh": 92,
                    "dx": ( game.app.width - 295 ) / 2,
                    "dy": ( game.app.height - 92 ) / 3,
                    "dw": 295,
                    "dh": 92
                },
                "button": {
                    "sx": 334,
                    "sy": 520,
                    "sw": 90,
                    "sh": 55,
                    "dx": ( game.app.width - 90 ) / 2,
                    "dy": ( ( game.app.height - 92 ) / 3 ) + 92 + 20,
                    "dw": 90,
                    "dh": 55
                }
            },
            "draw": function() {
                game._drawSpriteFromFrame( this.frames.ready );
                game._drawSpriteFromFrame( this.frames.button );
            }
        };

        // Background
        this.background = {
            "frame": {
                "sx": 0,
                "sy": 0,
                "sw": 820,
                "sh": 410,
                "dx": 0,
                "dy": 0,
                "dw": 820,
                "dh": 410
            },
            "speed": 1,
            "draw": function() {
                game._drawSpriteFromFrame( this.frame );
                game._drawSpriteFromFrame( this.frame, ( this.frame.dx + 820 ) );
            },
            "update": function() {
                if ( this.frame.dx <= ( this.frame.sw * -1 ) ) {
                    this.frame.dx = 0;
                }
                this.frame.dx -= this.speed;
                this.draw();
            }
        };

        // Ground
        this.ground = {
            "frame": {
                "sx": 0,
                "sy": 415,
                "sw": 185,
                "sh": 320,
                "dx": 0,
                "dy": game.app.height - 320,
                "dw": 185,
                "dh": 320
            },
            "speed": 6,
            "init": function() {
                while ( this.frame.dx <= ( this.frame.sw * 4 ) ) {
                    aGroundDx.push( this.frame.dx );
                    this.frame.dx += this.frame.sw;
                }
            },
            "draw": function( i ) {
                game._drawSpriteFromFrame( this.frame, aGroundDx[ i ] );
            },
            "update": function() {
                for ( var i = 0; i < aGroundDx.length; i++ ) {
                    if ( aGroundDx[ i ] <= ( this.frame.sw * -1 ) ) {
                        aGroundDx[ i ] += 925;
                    }
                    aGroundDx[ i ] -= this.speed;
                    this.draw( i );
                }
            }
        };

        // Display Lives
        this.displayLives = {
            "frames": {
                "background": {
                    "sx": 334,
                    "sy": 592,
                    "sw": 99,
                    "sh": 44,
                    "dx": 10,
                    "dy": 10,
                    "dw": 99,
                    "dh": 44
                },
                "head": {
                    "sx": 70,
                    "sy": 1186,
                    "sw": 18,
                    "sh": 16,
                    "dx": 10 + 15,
                    "dy": 10 + 14,
                    "dw": 18,
                    "dh": 16
                }
            },
            "init": function() {
                while ( this.frames.head.dx <= 25 * iLives ) {
                    aHeadDx.push( this.frames.head.dx );
                    this.frames.head.dx += 25;
                }
            },
            "draw": function() {
                game._drawSpriteFromFrame( this.frames.background );
                // draw heads
                for ( var i = 0; i < iLives; i++ ) {
                    game._drawSpriteFromFrame( this.frames.head, aHeadDx[ i ] );
                }
            }
        };

        // Shinobi
        this.shinobi = {
            "frames": [
                {
                    "sx": 0,
                    "sy": 880,
                    "sw": 50,    // 47
                    "sh": 52
                },
                {
                    "sx": 54,
                    "sy": 880,
                    "sw": 50,    // 47
                    "sh": 52
                },
                {
                    "sx": 109,
                    "sy": 880,
                    "sw": 50,    // 47
                    "sh": 52
                },
                {
                    "sx": 167,
                    "sy": 880,
                    "sw": 50,    // 44
                    "sh": 52
                },
                {
                    "sx": 226,
                    "sy": 880,
                    "sw": 50,    // 47
                    "sh": 52
                },
                {
                    "sx": 284,
                    "sy": 880,
                    "sw": 50,
                    "sh": 52
                }
            ],
            "init": function() {
                this.animation = {
                    "maxSteps": this.frames.length,
                    "step": 0
                };
                this.state = {
                    "isInDangerZone": false
                };
                this.score = {
                    "current": 0,
                    "previous": 0
                };
                this.position = {
                    "top": 0,
                    "bottom": 0,
                    "left": 0,
                    "right": 0
                };
                this.destinationFrame = {
                    "dx": ( game.app.width / 3 ) - 100,
                    "dy": game.app.height - ( 117 + 104 ),
                    "dw": 50,
                    "dh": 52
                };
            },
            "draw": function( iStep ) {
                var oContext = game.app.context,
                    oFrom = this.frames[ iStep ],
                    oDest = this.destinationFrame;

                oContext.save();
                oContext.translate( oDest.dx, oDest.dy );
                oContext.drawImage(
                    game.spriteSheet,
                    oFrom.sx,
                    oFrom.sy,
                    oFrom.sw,
                    oFrom.sh,
                    oDest.dw,
                    oDest.dh,
                    oDest.dw,
                    oDest.dh
                );
                oContext.restore();
            },
            "update": function( oEvent ) {
                var self = this;

                // handle event. we ensure that the sended event is the good one.
                if ( oEvent ) {
                    if ( oEvent.type === "click" || ( oEvent.type === "keyup" && oEvent.keyCode === 32 ) ) {
                        if ( !game.ended ) {
                            SmallWalls.generate( 3 );
                            game.started = true;
                        } else {
                            // restart game
                            return game.init();
                        }
                    } else {
                        return;
                    }
                }

                // don't update shinobi if game isn't started
                if ( !game.started ) {
                    return;
                }

                // update hitzone borders
                self.position.top = self.destinationFrame.dy + self.destinationFrame.dh;
                // top: 341
                self.position.bottom = self.destinationFrame.dy + self.destinationFrame.dh * 2;
                // bottom: 393
                self.position.left = self.destinationFrame.dx + self.destinationFrame.dw;
                // left: 188
                self.position.right = self.destinationFrame.dx + self.destinationFrame.dw * 2;
                // right: 238

                // check Walls hitzones collisions
                game.Walls.forEach( function( oWalls ) {
                    var oPosition = self.position,
                        oSmallWalls = oWalls.frame.small;

                    if ( oPosition.left < oSmallWalls.dx + oSmallWalls.dw && oPosition.left + ( oPosition.right - oPosition.left ) > oSmallWalls.dx && oPosition.top < oSmallWalls.dy + oSmallWalls.dh && ( oPosition.bottom - oPosition.top ) + oPosition.top > oSmallWalls.dy ) {
                        game.over();
                    } else {
                        self.state.isInDangerZone = true;
                    }
                } );

                // update score
                if ( self.state.isInDangerZone ) {
                    if ( self.score.current === self.score.previous ) {
                        self.score.current++;
                    }
                } else {
                    self.score.previous = self.score.current;
                }
                self.state.isInDangerZone = false;
            }
        };

        // Walls
        SmallWalls = function( iDxPosition ) {
            this.frame = {
                "small": {
                    "sx": 222,
                    "sy": 415,
                    "sw": 28,
                    "sh": 97,
                    "dx": iDxPosition,
                    "dy": game.app.height - ( 112 + 97 ),
                    "dw": 28,
                    "dh": 97
                }
            };
        };

        SmallWalls.prototype.draw = function() {
            game._drawSpriteFromFrame( this.frame.small );
        };

        SmallWalls.prototype.update = function() {
            this.frame.small.dx -= game.ground.speed;

            if ( this.frame.small.dx < ( this.frame.small.dw * -1 ) ) {
                this.frame.small.dx = game.app.width;
            }
            this.draw();
        };

        SmallWalls.lastGeneratedWallWidth = -1 * ( 50 + Math.floor( Math.random() * 250 ) );

        SmallWalls.generateNextWallWidth = function() {
            var iMultiplier = Math.round( Math.random() ) % 2 ? 1 : -1,
                iMaxGap = 100,
                iNewValue = SmallWalls.lastGeneratedWallWidth + Math.floor( Math.random() * iMaxGap ) * iMultiplier;

            ( iNewValue > -50 ) && ( iNewValue = -50 );
            ( iNewValue < -300 ) && ( iNewValue = -300 );

            SmallWalls.lastGeneratedWallWidth = iNewValue;

            return iNewValue;
        };

        SmallWalls.generate = function( iAmount ) {
            var i = 0,
                iWallStartingPosition = 714,
                iWallGap = 180;

            for ( ; i < iAmount; i++ ) {
                game.Walls.push( new SmallWalls( iWallStartingPosition + ( i * iWallGap ) ) );
            }
        };

        // Game Over Screen
        this.gameOverScreen = {
            "frames": {
                "title": {
                    "sx": 784,
                    "sy": 114,
                    "sw": 204,
                    "sh": 56,
                    "dx": ( game.app.width - 204 ) / 2,
                    "dy": 75,
                    "dw": 204,
                    "dh": 56
                },
                "modal": {
                    "sx": 0,
                    "sy": 516,
                    "sw": 238,
                    "sh": 126,
                    "dx": ( game.app.width - 238 ) / 2,
                    "dy": 150,
                    "dw": 238,
                    "dh": 126
                },
                "cyphers": {
                    "sx": 276,
                    "sw": 12,
                    "sh": 14,
                    "sy": {
                        "0": 646,
                        "1": 664,
                        "2": 698,
                        "3": 716,
                        "4": 750,
                        "5": 768,
                        "6": 802,
                        "7": 820,
                        "8": 854,
                        "9": 872
                    }
                },
                "medal": {
                    "sx": 242,
                    "sy": 564,
                    "sw": 44,
                    "sh": 44,
                    "dx": 0,
                    "dy": 0,
                    "dw": 44,
                    "dh": 44
                }
            },
            "draw": function() {
                game._drawSpriteFromFrame( this.frames.title );
                game._drawSpriteFromFrame( this.frames.modal );
            },
            "drawScore": function( iScore, bBestScore ) {
                var aScoreParts = ( iScore + "" ).split( "" ),
                    self = this;

                // drawing score
                aScoreParts.reverse().forEach( function( sScorePart, iIndex ) {
                    var iDxPosition = game.app.width / 2 + 91 - self.frames.cyphers.sw;

                    game._drawSpriteFromFrame( {
                        "sx": self.frames.cyphers.sx,
                        "sy": self.frames.cyphers.sy[ sScorePart ],
                        "sw": self.frames.cyphers.sw,
                        "sh": self.frames.cyphers.sh,
                        "dx": iDxPosition - ( iIndex * ( self.frames.cyphers.sw + 2 ) ),
                        "dy": self.frames.modal.dy + ( bBestScore ? 73 : 39 ),
                        "dw": self.frames.cyphers.sw,
                        "dh": self.frames.cyphers.sh
                    } );
                } );
            },
            "drawMedal": function() {
                this.frames.medal.dx = game.app.width / 2 - 87;
                this.frames.medal.dy = this.frames.modal.dy + 44;
                game._drawSpriteFromFrame( this.frames.medal );
            }
        };

        // Utils
        this._drawSpriteFromFrame = function( oFrame, iNewDx ) {
            var iDx;

            if ( iNewDx == null ) {
                iDx = oFrame.dx;
            } else {
                iDx = iNewDx;
            }
            this.app.context.drawImage(
                this.spriteSheet,
                oFrame.sx,
                oFrame.sy,
                oFrame.sw,
                oFrame.sh,
                iDx,
                oFrame.dy,
                oFrame.dw,
                oFrame.dh
            );
        };

        // Setup Animation loop
        this.animate = function() {
            this.time.current = Date.now();
            this.animationRequestID = window.requestAnimationFrame( this.animate.bind( this ) );

            // draw: clear
            this.app.context.clearRect( 0, 0, this.app.width, this.app.height );
            // draw: background
            this.background.update();
            // draw & animate: ground
            this.ground.update();
            // draw: displayLives
            this.displayLives.draw();
            // draw & animate: Walls
            this.Walls.forEach( function( oWalls ) {
                oWalls.update();
            } );
            // draw & animate: shinobi
            this.shinobi.update();
            if ( this.time.current - this.time.start > 50 ) {
                this.time.start = Date.now();
                ( ++this.shinobi.animation.step < this.shinobi.animation.maxSteps ) || ( this.shinobi.animation.step = 0 );
            }
            this.shinobi.draw( this.shinobi.animation.step );
            // draw start screen if needed
            if ( !game.started ) {
                this.starting.draw();
            }
        };

        // Game over
        this.over = function() {
            // var iCurrentScore = this.shinobi.score.current;

            window.cancelAnimationFrame( this.animationRequestID );

            this.ended = true;

            // reqwest( {
            //     "url": "http://hepl01.cblue.be/~user0/flapi/",
            //     "method": "POST",
            //     "type": "json",
            //     "data": {
            //         "a": "store",
            //         "r": "score",
            //         "score": iCurrentScore
            //     },
            //     "error": function( oError ) {
            //         console.error( oError );
            //     },
            //     "success": function( aScores ) {
            //         var iBestScore = +aScores[ 0 ].score;
            //
            //         if ( isNaN( iBestScore ) ) {
            //             return;
            //         }
            //
            //         game.gameOverScreen.draw();
            //         game.gameOverScreen.drawScore( iCurrentScore );
            //         game.gameOverScreen.drawScore( iBestScore, true );
            //
            //         if ( iBestScore === iCurrentScore ) {
            //             game.gameOverScreen.drawMedal();
            //         }
            //     }
            // } );
        };

        // Init game
        this.init = function() {
            // declare click & keyup events
            if ( !this.eventsSetted ) { // we need to be sure to listen to events only once. we use a boolean to do it.
                this.app.canvas.addEventListener( "click", this.shinobi.update.bind( this.shinobi ) );
                window.addEventListener( "keyup", this.shinobi.update.bind( this.shinobi ) );
                this.eventsSetted = true;
            }
            // reset some variables
            iLives = 3;
            this.started = false;
            this.ended = false;
            this.Walls = [];
            this.ground.init();
            this.displayLives.init();
            this.shinobi.init();
            this.time.start = Date.now();
            // launch animation
            this.animate();
        };

        // Load spritesheet
        this.spriteSheet = new Image();
        this.spriteSheet.addEventListener( "load", this.init.bind( this ) );
        this.spriteSheet.src = "./resources/sprite.png";
    };

    window.Shinobi = Shinobi;

} )();
