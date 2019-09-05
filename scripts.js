(function() {
    var fieldData = []
    var shipsData = []

    var misses = 0

    var shipsTemplates = [
        {
                count: 4,
                l: 1
        
        },
        {
                count: 3,
                l: 2
        
        },
        {
                count: 2,
                l: 3
        },
        {
                count: 1,
                l: 4
    
        }
    ]

    function createField() {
        for(var i = 0; i < 10; i++) {
            $("#top-coordinates").append("<div class='coordinates-item'>"+ i +"</div>")
            $("#left-coordinates").append("<div class='coordinates-item'>"+ i +"</div>")
        }

        for(var y = 0; y < 10; y++) {
            var row = []
            for(var x = 0; x < 10; x++) {
                $("#field").append("<div class='cell' x=" + x + " y=" + y + "></div>")
                var cell = {hasShip: false, missed: false}
                row.push(cell)
            }
            fieldData.push(row)
        }
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * (max + 1));
    }

    function isPlaceable(x, y, orientation, length) {
        var leftX, rightX, topY, bottomY;

        if(orientation == 0) {
            leftX = x - 1
            rightX = x + length
            topY = y - 1
            bottomY = y + 1

            if(x == 0) {
                leftX = x
            } else if(x + length > 9) {
                rightX = x + length - 1
            }

            if(y == 0) {
                topY = y
            } else if(y == 9) {
                bottomY = y
            }   
        } else {
            leftX = x - 1
            rightX = x + 1
            topY = y - 1
            bottomY = y + length

            if(y == 0) {
                topY = y
            } else if(y + length > 9) {
                bottomY = y + length - 1
            }

            if(x == 0) {
                leftX = x
            } else if(x == 9) {
                rightX = x
            }
        }

        return checkRange(leftX, rightX, topY, bottomY)
    }

    function checkRange(x0, x1, y0, y1) {
        for (var x = x0; x <= x1; x++) {
            for (var y = y0; y <= y1; y++) {
                if (fieldData[y][x].hasShip) {
                    return false
                }
            }
        }

        return true
    }

    function placeShip(length) {
        var randomX = 0
        var randomY = 0
        var orientation = getRandomInt(1)//0 - horizontal, 1 - vertical

        if(orientation == 0) {
            randomX = getRandomInt(10 - length)
            randomY = getRandomInt(9)
        } else {
            randomX = getRandomInt(9)
            randomY = getRandomInt(10 - length) 
        }

        if (!isPlaceable(randomX, randomY, orientation, length)) {
            return placeShip(length)
        }

        return getShip(randomX, randomY, length, orientation)
    }

    function getShip(startX, startY, length, orientation) {
        if(orientation == 0) {
            return getHorizontalShip(startX, startY, length)
        }

        return getVerticalShip(startX, startY, length)
    }

    function getVerticalShip(startX, startY, length) {
        var hp = []
        for(var i = 0; i < length; i++) {
            hp.push({x: startX, y: startY + i, damaged: false})
            fieldData[startY + i][startX].hasShip = true
        }
        return hp
    }

    function getHorizontalShip(startX, startY, length) {
        var hp = []
        for(var i = 0; i < length; i++) {
            hp.push({x: startX + i, y: startY, damaged: false})
            fieldData[startY][startX + i].hasShip = true
        }
        return hp
    }

    function placeShips() {
        for(var i = shipsTemplates.length - 1; i > -1; i--) {
            for(var j = 0; j < shipsTemplates[i].count; j++) {
                var shipHp = placeShip(shipsTemplates[i].l)
                shipsData.push({destroyed: false, hp: shipHp})
            }
        }
    }

    function startGame() {
        createField()
        placeShips()
    }

    function clickHandler() {
        var x = $(this).attr("x")
        var y = $(this).attr("y")
        if(fieldData[y][x].hasShip) {
            shipsData.forEach(function(ship) {
                ship.hp.forEach(function(hp) {
                    if(hp.x == x && hp.y == y) {
                        hp.damaged = true
                    }
                })
            })
        } else {
            fieldData[y][x].missed = true
            misses++
        }
        updateField(x, y, fieldData[y][x].missed)
    }

    function updateField(x, y, missed) {
        var cell = $("#field").children().filter(function() {
            return $(this).attr("x") == x && $(this).attr("y") == y;
        })
        if(missed) {
            $(cell).addClass("missed")
        } else {
            $(cell).addClass("damaged")
        }
        updateDestroyed()
    }

    function isShipDestroyed(ship) {
        var isDestroyed = true
        ship.hp.forEach(function(hp) {
            if(!hp.damaged) {
                isDestroyed = false
            }
        })

        return isDestroyed
    }

    function updateDestroyed() {
        shipsData.forEach(function(ship) {
            if(isShipDestroyed(ship)) {
                ship.destroyed = true
                ship.hp.forEach(function(hp) {
                    $("#field").children().filter(function() {
                        return $(this).attr("x") == hp.x && $(this).attr("y") == hp.y;
                    }).removeClass("damaged").addClass("destroyed")
                })
            }
        })
    }

    function isGameOver() {
        var isOver = true
        shipsData.forEach(function(ship) {
            if(!ship.destroyed) {
                isOver = false
            }
        })

        return isOver
    }

    function endGameHandler() {
        if(isGameOver()) {
            $("#win-screen").show()
            $("#win-screen").append("<div id='win-misses'>Промахов:"+ misses +"</div>")
        }
    }

    $(document).ready(function() {
        startGame();
        $(".cell").click(clickHandler)
        $(".cell").click(endGameHandler)
    });
}());