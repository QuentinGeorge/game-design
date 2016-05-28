( function() {

    "use strict";

    var Shinobi;

    // Game Manager

    Shinobi = function( oApp ) {

        var game = this,
            SmallWall,
            Ennemie,
            EnnemyKunai,
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
            "speed": 0,
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
        // this.ground = {
        //     "frame": {
        //         "sx": 0,
        //         "sy": 415,
        //         "sw": 185,
        //         "sh": 320,
        //         "dx": 0,
        //         "dy": game.app.height - 320,
        //         "dw": 185,
        //         "dh": 320
        //     },
                    // initial ground

        this.ground = {
            "frame": {
                "sx": 0,
                "sy": 612,
                "sw": 185,
                "sh": 123,
                "dx": 0,
                "dy": game.app.height - 123,
                "dw": 185,
                "dh": 123
            },  // Temporary ground without sub part to avoid contrast matter with Obstacles Obstruction.
            "speed": 0,
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
                while ( this.frames.head.dx <= 25 * game.lives ) {
                    aHeadDx.push( this.frames.head.dx );
                    this.frames.head.dx += 25;
                }
            },
            "draw": function() {
                game._drawSpriteFromFrame( this.frames.background );
                // draw heads
                for ( var i = 0; i < game.lives; i++ ) {
                    game._drawSpriteFromFrame( this.frames.head, aHeadDx[ i ] );
                }
            }
        };

        // Shinobi
        this.shinobi = {
            "frames": {
                "run": [
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
                "jump": {
                    "up": [
                        {
                            "sx": 0,
                            "sy": 944,
                            "sw": 34,
                            "sh": 64
                        },
                        {
                            "sx": 58,
                            "sy": 944,
                            "sw": 34,
                            "sh": 64
                        }
                    ],
                    "down": [
                        {
                            "sx": 106,
                            "sy": 951,
                            "sw": 44,
                            "sh": 57
                        },
                        {
                            "sx": 156,
                            "sy": 951,
                            "sw": 44,
                            "sh": 57
                        }
                    ]
                }
            },
            "init": function() {
                this.animation = {
                    "maxSteps": this.frames.run.length,
                    "step": 0
                };
                this.state = {
                    "isInDangerZone": false,
                    "acceleration": 0
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
                this.runDestinationFrame = {
                    "dx": ( game.app.width / 3 ) - 100,
                    "dy": game.app.height - ( 117 + 104 ),
                    "dw": 50,
                    "dh": 52
                };
                this.jumpDestinationFrame = {
                    "dx": this.runDestinationFrame.dx + ( ( this.runDestinationFrame.dw - 34) * 2 ),
                    "dy": this.runDestinationFrame.dy - ( ( 64 - this.runDestinationFrame.dh ) * 2 ),
                    "dw": 34,
                    "dh": 64
                };
                this.jumpInAir = false;
                this.jumpTop = false;
                this.jumpDown = false;
                this.jumpTemp = false;
                this.jumpTimeStarted = 0;
                this.jumpTimeCurrent = 0;
                this.destinationFrame = this.runDestinationFrame;
            },
            "draw": function( oFrom ) {
                var oContext = game.app.context,
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
            "run": function() {
                var iStep = this.animation.step,
                    oFrom = this.frames.run[ iStep ];

                this.destinationFrame = this.runDestinationFrame;

                this.draw( oFrom );
            },
            "jump": function() {
                var iStep = this.animation.step,
                    oFrom = {},
                    iMaxJump = this.runDestinationFrame.dy - ( 97/* SmallWall sh */ + this.jumpDestinationFrame.dh );

                this.jumpInAir = true;

                if ( this.destinationFrame.dy <= iMaxJump ) {
                    this.jumpTop = true;
                }

                // Time staying in the air before falling
                if ( this.jumpTimeCurrent - this.jumpTimeStarted >= 100 ) {
                    this.jumpDown = true;
                }

                if ( this.destinationFrame.dy > iMaxJump && this.jumpTop == false ) {
                    // Rising
                    this.jumpDestinationFrame.dy -= game.ground.speed;
                    if ( iStep < this.animation.maxSteps / 2 ) {
                        oFrom = this.frames.jump.up[ 0 ];
                    } else {
                        oFrom = this.frames.jump.up[ 1 ];
                    }
                    this.jumpDestinationFrame.dw = this.frames.jump.up[ 0 ].sw;
                    this.jumpDestinationFrame.dh = this.frames.jump.up[ 0 ].sh;
                } else {
                    // Create time count
                    this.jumpTimeCurrent = Date.now();
                    if ( this.jumpTemp == false ) {
                        this.jumpTimeStarted = Date.now();
                        this.jumpTemp = true;
                    }
                    // Falling
                    if ( this.jumpDown == true ) {
                        this.jumpDestinationFrame.dy += game.ground.speed;
                        if ( iStep < this.animation.maxSteps / 2 ) {
                            oFrom = this.frames.jump.down[ 0 ];
                        } else {
                            oFrom = this.frames.jump.down[ 1 ];
                        }
                        this.jumpDestinationFrame.dw = this.frames.jump.down[ 0 ].sw;
                        this.jumpDestinationFrame.dh = this.frames.jump.down[ 0 ].sh;
                    } else {
                        // Continue to apply jump up frames during the time we are staying in the air.
                        if ( iStep < this.animation.maxSteps / 2 ) {
                            oFrom = this.frames.jump.up[ 0 ];
                        } else {
                            oFrom = this.frames.jump.up[ 1 ];
                        }
                        this.jumpDestinationFrame.dw = this.frames.jump.up[ 0 ].sw;
                        this.jumpDestinationFrame.dh = this.frames.jump.up[ 0 ].sh;
                    }
                }

                this.destinationFrame = this.jumpDestinationFrame;
                this.draw( oFrom );
            },
            "update": function( oEvent ) {
                var self = this;

                // handle event. we ensure that the sended event is the good one.
                if ( oEvent ) {
                    if ( oEvent.type === "mousedown" || ( oEvent.type === "keydown" && oEvent.keyCode === 32 ) ) {
                        if ( !game.ended ) {
                            if ( !self.state.acceleration ) {
                                // since we know that this is the first click/keypress on bird, we can generate tubes here
                                game.obstruction.generate();
                                game.started = true;
                                self.state.acceleration = 3;
                                game.ground.speed += self.state.acceleration;
                            } else {
                                //  If he isn't already in the air, he can jump
                                if ( self.jumpInAir == false ) {
                                    // resetting jump temporaries variables
                                    self.jumpTop = false;
                                    self.jumpDown = false;
                                    self.jumpTemp = false;
                                    self.jumpTimeStarted = 0;
                                    self.jumpTimeCurrent = 0;
                                    self.jump();
                                }
                            }
                        } else {
                            // restart game
                            return game.init();
                        }
                    } else {
                        return;
                    }
                } else {
                    if ( this.destinationFrame.dy < this.runDestinationFrame.dy ) {
                        self.jump();
                    } else {
                        self.jumpInAir = false;
                        self.run();
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

                // check Obstacles hitzones collisions
                game.Obstacles.forEach( function( oObstacles ) {
                    var i = 0,
                        oPosition = self.position,
                        oObstruction = oObstacles.frames.smallWall,
                        bIsEnnemy = false;

                    if ( oObstruction == undefined ) {
                        oObstruction = oObstacles.frames.ennemies;
                        bIsEnnemy = true;
                    } // Update path for ennemies

                    if ( oPosition.left < oObstruction.dx + oObstruction.dw && oPosition.left + ( oPosition.right - oPosition.left ) > oObstruction.dx && oPosition.top < oObstruction.dy + oObstruction.dh && ( oPosition.bottom - oPosition.top ) + oPosition.top > oObstruction.dy ) {
                        if ( bIsEnnemy == true ) {
                            game.lives--;
                            game.Obstacles.pop();
                        } else {
                            game.over();
                        }
                    } else {
                        self.state.isInDangerZone = true;
                    }
                } );

                // check Projectiles hitzones collisions
                game.Projectiles.forEach( function( oProjectiles ) {
                    var i = 0,
                        oPosition = self.position,
                        oObstruction = oProjectiles.frames.kunai;

                    if ( oPosition.left < oObstruction.dx + oObstruction.dw && oPosition.left + ( oPosition.right - oPosition.left ) > oObstruction.dx && oPosition.top < oObstruction.dy + oObstruction.dh && ( oPosition.bottom - oPosition.top ) + oPosition.top > oObstruction.dy ) {
                        game.lives--;
                        game.Projectiles.pop();
                    } else {
                        self.state.isInDangerZone = true;
                    }
                } );

                if ( game.lives == 0 ) {
                    game.over();
                }

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


        // Obstruction obstacles objects functions and varialbles
        this.obstruction = {
            "init": function() {
                this.lastGeneratedObstacleWidth = game.app.width; // Init whith canvas width to be sure that the first Obstacle will be created far enought.
                this.newObstacleWidth = 0;
                this.ObstacleGap = 350; // Minimal value between Obstacles
                this.ObstacleOffsetHasard = 500; // More this value is big, more the gap between Obstacles can be higher.
                this.EnnemiesPositions = []; // To reccord ennemies positions in the table "Obstacles". When unshift new object in the table "Obstacles", unshift 1 in "EnnemiesPositions" if it is an ennemie or 0 if not. D'ont forget to pop "EnnemiesPositions" when pop "Obstacles"
            },
            "generateNextObstacle": function() {
                this.newObstacleWidth = this.lastGeneratedObstacleWidth + Math.floor( Math.random() * this.ObstacleOffsetHasard ) + this.ObstacleGap;
            },
            "generate": function() {
                this.generateNextObstacle();
                if ( Math.floor( Math.random() * 10 ) < 3 ) {
                    game.Obstacles.unshift( new Ennemie() );
                    this.EnnemiesPositions.unshift( 1 );
                    game.Projectiles.unshift( new EnnemyKunai() );
                    // when we create a new obstacle, there is a chance to create an ennemie in place of a wall
                } else {
                    game.Obstacles.unshift( new SmallWall() );
                    this.EnnemiesPositions.unshift( 0 );
                }
            },
            "update": function() {
                var i = 0;

                this.lastGeneratedObstacleWidth = 0;

                for ( ; i < game.Obstacles.length; i++ ) {
                    if ( this.EnnemiesPositions[ i ] == 1 ) {
                        if ( game.Obstacles[ i ].frames.ennemies.dx > this.lastGeneratedObstacleWidth ) {
                            this.lastGeneratedObstacleWidth = game.Obstacles[ i ].frames.ennemies.dx;
                        }

                    } else {
                        if ( game.Obstacles[ i ].frames.smallWall.dx > this.lastGeneratedObstacleWidth ) {
                            this.lastGeneratedObstacleWidth = game.Obstacles[ i ].frames.smallWall.dx;
                        }
                    }
                } // Allways record the position of the latest created Obstacle

                if ( this.lastGeneratedObstacleWidth < game.app.width - this.ObstacleGap ) {
                    this.generate();
                } // If we don't have enought ostacles, we generate more Obstacles
            }
        };

        // EnnemyKunai
        EnnemyKunai = function() {
            this.frames = {
                "kunai": {
                    "sx": 228,
                    "sy": 1377,
                    "sw": 20,
                    "sh": 7,
                    "dx": game.obstruction.newObstacleWidth,
                    "dy": game.app.height - ( 112 + 62 - 25 ),
                    "dw": 20,
                    "dh": 7
                }
            };
        };

        EnnemyKunai.prototype.draw = function() {
            game._drawSpriteFromFrame( this.frames.kunai );
        };

        EnnemyKunai.prototype.update = function() {
            this.frames.kunai.dx -= ( game.ground.speed * 2 );

            if ( this.frames.kunai.dx < ( this.frames.kunai.dw * -1 ) ) {
                game.Projectiles.pop();
            } // Check if a projectile get out of the Canvas and delete it

            this.draw();
        };

        // SmallWalls
        SmallWall = function() {
            this.frames = {
                "smallWall": {
                    "sx": 222,
                    "sy": 415,
                    "sw": 28,
                    "sh": 97,
                    "dx": game.obstruction.newObstacleWidth,
                    "dy": game.app.height - ( 112 + 97 ),
                    "dw": 28,
                    "dh": 97
                }
            };
        };

        SmallWall.prototype.draw = function() {
            game._drawSpriteFromFrame( this.frames.smallWall );
        };

        SmallWall.prototype.update = function() {
            this.frames.smallWall.dx -= game.ground.speed;

            if ( this.frames.smallWall.dx < ( this.frames.smallWall.dw * -1 ) ) {
                game.Obstacles.pop();
                game.obstruction.EnnemiesPositions.pop();
            } // Check if an obstacle get out of the Canvas and delete it

            this.draw();
        };

        // Ennemies
        Ennemie = function() {
            this.frames = {
                "ennemies": {
                    "sx": 0,
                    "sy": 1220,
                    "sw": 54,
                    "sh": 63,
                    "dx": game.obstruction.newObstacleWidth,
                    "dy": game.app.height - ( 112 + 63 ),
                    "dw": 54,
                    "dh": 63
                }
            };
        };

        Ennemie.prototype.draw = function() {
            game._drawSpriteFromFrame( this.frames.ennemies );
        };

        Ennemie.prototype.update = function() {
            this.frames.ennemies.dx -= game.ground.speed;

            if ( this.frames.ennemies.dx < ( this.frames.ennemies.dw * -1 ) ) {
                game.Obstacles.pop();
                game.obstruction.EnnemiesPositions.pop();
            } // Check if an obstacle get out of the Canvas and delete it

            this.draw();
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
            // draw & animate: Obstacles
            this.Obstacles.forEach( function( oObstacles ) {
                oObstacles.update();
            } );
            if ( game.started == true) {
                this.obstruction.update();
            }
            // draw & animate: Projectiles
            this.Projectiles.forEach( function( oProjectiles ) {
                oProjectiles.update();
            } );
            // draw & animate: shinobi
            if ( this.time.current - this.time.start > 50 ) {
                this.time.start = Date.now();
                ( ++this.shinobi.animation.step < this.shinobi.animation.maxSteps ) || ( this.shinobi.animation.step = 0 );
            }
            this.shinobi.update();
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
                this.app.canvas.addEventListener( "mousedown", this.shinobi.update.bind( this.shinobi ) );
                window.addEventListener( "keydown", this.shinobi.update.bind( this.shinobi ) );
                this.eventsSetted = true;
            }
            // reset some variables
            game.lives = 3;
            game.ground.speed = 3;
            game.background.speed = game.ground.speed / 4;
            game.started = false;
            game.ended = false;
            game.Obstacles = [];
            game.Projectiles = [];
            game.ground.init();
            game.displayLives.init();
            game.obstruction.init();
            game.shinobi.init();
            game.time.start = Date.now();
            // launch animation
            game.animate();
        };

        // Load spritesheet
        this.spriteSheet = new Image();
        this.spriteSheet.addEventListener( "load", this.init.bind( this ) );
        this.spriteSheet.src = "./resources/sprite.png";
    };

    window.Shinobi = Shinobi;

} )();
