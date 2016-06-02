( function() {

    "use strict";

    var Shinobi;

    // Game Manager

    Shinobi = function( oApp ) {

        var game = this, // eslint-disable-line consistent-this
            SmallWall,
            Ennemy,
            EnnemyKunai;

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
            },
            "groundsDx": [],
            "speed": 0,
            "init": function() {
                while ( this.frame.dx <= ( this.frame.sw * 4 ) ) {
                    this.groundsDx.push( this.frame.dx );
                    this.frame.dx += this.frame.sw;
                }
            },
            "draw": function( i ) {
                game._drawSpriteFromFrame( this.frame, this.groundsDx[ i ] );
            },
            "update": function() {
                var i = 0;

                for ( ; i < this.groundsDx.length; i++ ) {
                    if ( this.groundsDx[ i ] <= ( this.frame.sw * -1 ) ) {
                        this.groundsDx[ i ] += 925;
                    }
                    this.groundsDx[ i ] -= this.speed;
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
            "headsDx": [],
            "init": function() {
                while ( this.frames.head.dx <= 25 * game.lives ) {
                    this.headsDx.push( this.frames.head.dx );
                    this.frames.head.dx += 25;
                }
            },
            "draw": function() {
                var i = 0;

                game._drawSpriteFromFrame( this.frames.background );
                // draw heads
                for ( ; i < game.lives; i++ ) {
                    game._drawSpriteFromFrame( this.frames.head, this.headsDx[ i ] );
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
                    "acceleration": 0
                };
                this.score = {
                    "current": 0
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
                    "dx": this.runDestinationFrame.dx + ( ( this.runDestinationFrame.dw - 34 ) * 2 ),
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
                    iJumpSpeed = 6,
                    iMaxJump = this.runDestinationFrame.dy - ( 97/* SmallWall sh */ + this.jumpDestinationFrame.dh );

                this.jumpInAir = true;

                if ( this.destinationFrame.dy <= iMaxJump ) {
                    this.jumpTop = true;
                }

                // Time staying in the air before falling
                if ( this.jumpTimeCurrent - this.jumpTimeStarted >= 200 ) {
                    this.jumpDown = true;
                }

                if ( this.destinationFrame.dy > iMaxJump && this.jumpTop === false ) {
                    // Rising
                    this.jumpDestinationFrame.dy -= iJumpSpeed;
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
                    if ( this.jumpTemp === false ) {
                        this.jumpTimeStarted = Date.now();
                        this.jumpTemp = true;
                    }
                    // Falling
                    if ( this.jumpDown === true ) {
                        this.jumpDestinationFrame.dy += iJumpSpeed;
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
                            //  If he isn't already in the air, he can jump
                            if ( self.jumpInAir === false && self.state.acceleration > 0 ) {
                                // resetting jump temporaries variables
                                self.jumpTop = false;
                                self.jumpDown = false;
                                self.jumpTemp = false;
                                self.jumpTimeStarted = 0;
                                self.jumpTimeCurrent = 0;
                                self.jump();
                            }
                            if ( !self.state.acceleration ) {
                                // since we know that this is the first click/keypress, we can generate obstacles here
                                game.obstruction.generate();
                                game.started = true;
                                self.state.acceleration = 3;
                                game.ground.speed += self.state.acceleration;
                                game.increaseDifficultyByTime.originalGroundSpeed += self.state.acceleration; // Don't forget for the function increaseDifficultyByTime
                            }
                        } else {
                            // restart game
                            return game.init();
                        }
                    } else {
                        return;
                    }
                }
                if ( this.destinationFrame.dy < this.runDestinationFrame.dy ) {
                    self.jump();
                } else {
                    self.jumpInAir = false;
                    self.run();
                }

                // don't update shinobi if game isn't started
                if ( !game.started ) {
                    return;
                }

                // update hitzone borders
                self.position.top = self.destinationFrame.dy + self.destinationFrame.dh;
                // top: 341
                self.position.bottom = ( self.destinationFrame.dy + self.destinationFrame.dh * 2 ) - 4; // -4 to ameliorate collision performances when is in jump form
                // bottom: 393
                self.position.left = ( self.destinationFrame.dx + self.destinationFrame.dw ) + 6; // +6 to ameliorate collision performances when is in jump down form
                // left: 188
                self.position.right = self.destinationFrame.dx + self.destinationFrame.dw * 2;
                // right: 238

                // check Obstacles hitzones collisions
                game.Obstacles.forEach( function( oObstacles ) {
                    var oPosition = self.position,
                        bIsEnnemy = false,
                        oObstruction = {};

                    // Update path
                    if ( oObstacles.frames.smallWall === undefined ) {
                        oObstruction = {
                            "dx": oObstacles.frames.ennemies.dx + 12,
                            "dy": oObstacles.frames.ennemies.dy + 6,
                            "dw": oObstacles.frames.ennemies.dw - 33,
                            "dh": oObstacles.frames.ennemies.dh - 6
                        };  // values for ameliorate ennemies collisions performances
                        bIsEnnemy = true;
                    } else {
                        oObstruction = {
                            "dx": oObstacles.frames.smallWall.dx,
                            "dy": oObstacles.frames.smallWall.dy,
                            "dw": oObstacles.frames.smallWall.dw,
                            "dh": oObstacles.frames.smallWall.dh
                        };
                    }

                    // check if collision
                    if ( oPosition.left < oObstruction.dx + oObstruction.dw && oPosition.left + ( oPosition.right - oPosition.left ) > oObstruction.dx && oPosition.top < oObstruction.dy + oObstruction.dh && ( oPosition.bottom - oPosition.top ) + oPosition.top > oObstruction.dy ) {
                        if ( bIsEnnemy === true ) {
                            game.lives--;
                            game.Obstacles.pop();
                        } else {
                            game.over();
                        }
                    }
                } );

                // check Projectiles hitzones collisions
                game.Projectiles.forEach( function( oProjectiles ) {
                    var oPosition = self.position,
                        oObstruction = oProjectiles.frames.kunai;

                    if ( oPosition.left < oObstruction.dx + oObstruction.dw && oPosition.left + ( oPosition.right - oPosition.left ) > oObstruction.dx && oPosition.top < oObstruction.dy + oObstruction.dh && ( oPosition.bottom - oPosition.top ) + oPosition.top > oObstruction.dy ) {
                        game.lives--;
                        game.Projectiles.pop();
                    }
                } );

                // Check if is always alive
                if ( game.lives === 0 ) {
                    game.displayLives.draw(); // to clear the last head emplacement on the screen
                    game.over();
                }

                // draw score
                oApp.context.font = "bold 20px 'Arial'";
                oApp.context.textAlign = "right";
                oApp.context.fillText( this.score.current, game.app.width - 10, 30 );
            }
        };


        // Obstruction obstacles objects functions and varialbles
        this.obstruction = {
            "init": function() {
                this.lastGeneratedObstacleWidth = game.app.width; // Init whith canvas width to be sure that the first Obstacle will be created far enought.
                this.newObstacleWidth = 0;
                this.ObstacleGap = 350; // Minimal value between Obstacles
                this.ObstacleOffsetHasard = 500; // More this value is big, more the gap between Obstacles can be higher.
                this.EnnemiesPositions = []; // To reccord ennemies positions in the table "Obstacles". When unshift new object in the table "Obstacles", unshift 1 in "EnnemiesPositions" if it is an Ennemy or 0 if not. D'ont forget to pop "EnnemiesPositions" when pop "Obstacles"
                this.OffsetOffEnnemiesNumber = 1; // To decrese the number of ennemies, put a smaller cypher, or a bigger to have more ennemies
            },
            "generateNextObstacle": function() {
                this.newObstacleWidth = this.lastGeneratedObstacleWidth + Math.floor( Math.random() * this.ObstacleOffsetHasard ) + this.ObstacleGap;
            },
            "generate": function() {
                this.generateNextObstacle();
                if ( Math.floor( Math.random() * 10 ) < this.OffsetOffEnnemiesNumber ) {
                    game.Obstacles.unshift( new Ennemy() );
                    this.EnnemiesPositions.unshift( 1 );
                    game.Projectiles.unshift( new EnnemyKunai() );
                    // when we create a new obstacle, there is a chance to create an Ennemy in place of a wall
                } else {
                    game.Obstacles.unshift( new SmallWall() );
                    this.EnnemiesPositions.unshift( 0 );
                }
            },
            "update": function() {
                var i = 0;

                this.lastGeneratedObstacleWidth = 0;

                for ( ; i < game.Obstacles.length; i++ ) {
                    if ( this.EnnemiesPositions[ i ] === 1 ) {
                        if ( game.Obstacles[ i ].frames.ennemies.dx > this.lastGeneratedObstacleWidth ) {
                            this.lastGeneratedObstacleWidth = game.Obstacles[ i ].frames.ennemies.dx;
                        }
                    }
                    if ( this.EnnemiesPositions[ i ] === 0 && game.Obstacles[ i ].frames.smallWall.dx > this.lastGeneratedObstacleWidth ) {
                        this.lastGeneratedObstacleWidth = game.Obstacles[ i ].frames.smallWall.dx;

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
        Ennemy = function() {
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

        Ennemy.prototype.draw = function() {
            game._drawSpriteFromFrame( this.frames.ennemies );
        };

        Ennemy.prototype.update = function() {
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
                    "sx": 334,
                    "sy": 656,
                    "sw": 319,
                    "sh": 48,
                    "dx": ( game.app.width - 319 ) / 2,
                    "dy": ( game.app.height - 48 ) / 3,
                    "dw": 319,
                    "dh": 48
                }
            },
            "draw": function() {
                game._drawSpriteFromFrame( this.frames.title );
            },
            "drawScore": function( iScore ) {
                oApp.context.font = "bold 30px 'Arial'";
                oApp.context.textAlign = "center";
                oApp.context.fillText( "Votre Score : " + iScore, game.app.width / 2, ( game.app.height ) / 2 );
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

        this.increaseDifficultyByTime = {
            "init": function() {
                this.originalOffsetOffEnnemiesNumber = game.obstruction.OffsetOffEnnemiesNumber;
                this.originalGroundSpeed = game.ground.speed;
                this.difficultyOffset = 0;
            },
            "update": function() {
                this.difficultyOffset = Math.floor( ( game.shinobi.score.current / 100 ) * 1 );  // increase last number to increase game difficulty faster
                game.obstruction.OffsetOffEnnemiesNumber = this.originalOffsetOffEnnemiesNumber + this.difficultyOffset;
                game.ground.speed = ( this.originalGroundSpeed + Math.floor( this.difficultyOffset / 2 ) );
            }
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
            if ( game.started === true ) {
                this.obstruction.update();
            }
            // draw & animate: Projectiles
            this.Projectiles.forEach( function( oProjectiles ) {
                oProjectiles.update();
            } );
            // draw & animate: shinobi + count score if game is started
            if ( this.time.current - this.time.start > 50 ) {
                this.time.start = Date.now();
                ( ++this.shinobi.animation.step < this.shinobi.animation.maxSteps ) || ( this.shinobi.animation.step = 0 ) || ( game.started !== true ) || ( ++this.shinobi.score.current );
            }
            this.shinobi.update();
            // increase difficulty by time
            this.increaseDifficultyByTime.update();
            // draw start screen if needed
            if ( !game.started ) {
                this.starting.draw();
            }
        };

        // Game over
        this.over = function() {
            var iCurrentScore = this.shinobi.score.current;

            window.cancelAnimationFrame( this.animationRequestID );

            this.ended = true;

            game.gameOverScreen.draw();
            game.gameOverScreen.drawScore( iCurrentScore );
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
            this.lives = 3;
            this.ground.speed = 1;
            this.background.speed = this.ground.speed / 4;
            this.started = false;
            this.ended = false;
            this.Obstacles = [];
            this.Projectiles = [];
            this.ground.init();
            this.displayLives.init();
            this.obstruction.init();
            this.shinobi.init();
            this.increaseDifficultyByTime.init();
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
