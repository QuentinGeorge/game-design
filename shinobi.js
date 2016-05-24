( function() {

    "use strict";

    var Shinobi;

    // Game Manager

    Shinobi = function( oApp ) {

        var game = this,
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
            "speed": 3,
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
                    "isInDangerZone": false,
                    "speed": 0,
                    "acceleration": 0,
                    "boost": 0
                };
                this.score = {
                    "current": 0,
                    "previous": 0
                };
                this.position = {
                    "top": 0,
                    "bottom": 0
                };
                this.destinationFrame = {
                    "dx": ( game.app.width / 3 ) - 100,
                    "dy": game.app.height - ( 115 + 104 ),
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
                            if ( !self.state.acceleration ) {
                                // since we know that this is the first click/keypress on shinobi, we can generate tubes here
                                // TubesPair.generate( 2 );
                                game.started = true;
                                self.state.acceleration = 0.4;
                                self.state.boost = -5;
                            } else {
                                self.state.speed = self.state.boost;
                            }
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

                // handle game over
                if ( self.destinationFrame.dy >= game.ground.frame.dy - self.destinationFrame.dh / 2 ) {
                    game.over();
                } else {
                    self.state.speed += self.state.acceleration;
                    self.destinationFrame.dy += self.state.speed;
                }

                // update hitzone borders
                self.position.top = self.destinationFrame.dy - self.destinationFrame.dh / 2;
                self.position.bottom = self.destinationFrame.dy + self.destinationFrame.dh / 2;
                self.position.left = self.destinationFrame.dx - self.destinationFrame.dw / 2;
                self.position.right = self.destinationFrame.dx + self.destinationFrame.dw / 2;

                // check tubes hitzones collisions
                // game.tubes.forEach( function( oTubesPair ) {
                //     var oPosition = self.position;
                //
                //     if ( oPosition.left > oTubesPair.frame.top.dx - self.destinationFrame.dw && oPosition.right < oTubesPair.frame.top.dx + oTubesPair.frame.top.dw ) {
                //         if ( oPosition.top < oTubesPair.frame.top.dy + oTubesPair.frame.top.dh || oPosition.bottom > oTubesPair.frame.bottom.dy ) {
                //             game.over();
                //         } else {
                //             self.state.isInDangerZone = true;
                //         }
                //     }
                // } );

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

        // Game Over Screen

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
            // // draw & animate: tubes
            // this.tubes.forEach( function( oTubesPair ) {
            //     oTubesPair.update();
            // } );
            // draw & animate: ground
            this.ground.update();
            // draw: displayLives
            this.displayLives.draw();
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
            // this.tubes = [];
            this.ground.init();
            this.displayLives.init();
            this.shinobi.init(); // resetting variables for shinobi
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
