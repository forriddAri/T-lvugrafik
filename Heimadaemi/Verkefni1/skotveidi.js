var canvas;
var gl;

var vertex = [];

var lastShotTime = Date.now();

var mouseX;
var movement = false;
var program;

let score = 0;

/**
 * @param 
 */
var birds = [];
var bird = [
    //body
    vec2(-0.1, 0.07),
    vec2(0.1, 0.07),
    vec2(-0.1, -0.07),
    vec2(0.1, 0.07),
    vec2(-0.1, -0.07),
    vec2(0.1, -0.07),
    //augabrunir
    vec2(0.1,0.05),
    vec2(0.1, 0.00),
    vec2(0.005, 0.00),
    vec2(-0.1,0.05),
    vec2(-0.1, 0.00),
    vec2(-0.005, 0.0),
    //goggur
    vec2(0.1, 0.05),  
    vec2(0.1, 0.00),  
    vec2(0.05, 0.025),
];

var birdColors = [
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(1.0, 0.647, 0.0, 1.0)
];

var shots = [];
var shotColor = vec4(0, 0.7, 0.2, 1.0);
var shot = [
    vec2(-0.01, 0),
    vec2(0.01, 0),
    vec2(-0.01, -0.1),
    vec2(0.01, 0),
    vec2(0.01, -0.1),
    vec2(-0.01, -0.1)
]
var gun = [
    vec2(-0.1, -0.85),
    vec2(-0.5, -0.85),
    vec2(-0.3, -0.7)
];
var gunColor = vec4(0.486, 0.988, 0.0, 1.0);
var sky = [
    vec2(-1, 0.8),
    vec2(-1, -0.5),
    vec2(1, -0.5),
    vec2(-1, 0.8),
    vec2(1, -0.5),
    vec2(1, 0.8)
]
var skyColor = vec4(0.529, 0.808, 0.922, 1.0);
var grass = [
    vec2(-1, -0.5),
    vec2(-1, -1),
    vec2(1, -1),
    vec2(-1, -0.5),
    vec2(1, -1),
    vec2(1, -0.5)
]
var grassColor = vec4(0.4, 0.239, 0.078, 1.0);
var scoreBox = [
    vec2(-1, 1),
    vec2(-1, 0.8),
    vec2(1, 0.8),
    vec2(-1, 1),
    vec2(1, 0.8),
    vec2(1, 1)
];
var scoreBoxColor = vec4(0, 0, 0, 1);

scoreBar = [
    vec2(0, 0),
    vec2(0, -0.1),
    vec2(0.02, 0),
    vec2(0, -0.1),
    vec2(0.02, 0),
    vec2(0.02, -0.1)
];








window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Other event listeners here...
    window.addEventListener("resize", function () {
        setCanvasSize(canvas);
    });


    // Event listeners for mouse
    canvas.addEventListener("mousedown", function (e) {
        movement = true;
        mouseX = e.offsetX;
    });

    canvas.addEventListener("mouseup", function (e) {
        movement = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (movement) {
            var xmove = 2 * (e.offsetX - mouseX) / canvas.width;
            mouseX = e.offsetX;
            for (i = 0; i < 3; i++) {
                gun[i][0] += xmove;
            }
        }
    });

    window.addEventListener("resize", function () {
        setCanvasSize(canvas);
    });
    setCanvasSize(canvas);

    window.addEventListener("keydown", function(event) {
        if (event.code === "Space") {
            if(shots.length < 3){
            shots.push(vec2(gun[2][0], gun[2][1]));
            }
        }
    });

    render();
}


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    if (score < 5) {
        updateEntities();
        drawPointsToBuffer();
    }
    gl.drawArrays(gl.TRIANGLES, 0, vertex.length);

    window.requestAnimFrame(render);
}


function drawPointsToBuffer() {
    vertex = [];
    var colors = [];

    // teikna himinn
    for (var i = 0; i < sky.length; i++) {
        vertex.push(sky[i]);
        colors.push(skyColor);
    }

    // teikna gras
    for (var i = 0; i < grass.length; i++) {
        vertex.push(grass[i]);
        colors.push(grassColor);
    }

    //teikna scorebox
    for (var i = 0; i < scoreBox.length; i++) {
        vertex.push(scoreBox[i]);
        colors.push(scoreBoxColor);
    }
    // teikna skot
    for (var i = 0; i < shots.length; i++) {
        for (var j = 0; j < shot.length; j++) {
            vertex.push(vec2(shots[i][0] + shot[j][0], shots[i][1] + shot[j][1]));
            colors.push(shotColor);
        }
    }

    // teikna fugla
    for (var i = 0; i < birds.length; i++) {
        for (var j = 0; j < bird.length; j++) {
            if (birds[i][2] < 0) {
                vertex.push(vec2(birds[i][0] - bird[j][0], birds[i][1] + bird[j][1]));
            } else {
                vertex.push(vec2(birds[i][0] + bird[j][0], birds[i][1] + bird[j][1]));
            }
            if (j >= 9) {
                colors.push(birdColors[2]);
            } else if (j >= 6) {
                colors.push(birdColors[3]);
            } else {
                colors.push(birdColors[0]);
            }
        }
    }

    // teikna byssu
    for (var i = 0; i < gun.length; i++) {
        vertex.push(gun[i]);
        colors.push(gunColor);
    }

    // teikna stig
    for (var i = 0; i < score; i++) {
        var scoreItem = scoreBar;
            for (var j = 0; j < scoreItem.length; j++) {
                vertex.push(vec2(-0.95 + scoreItem[j][0] + (i < 5 ? i : 0) * 0.04 + 0.9, 0.95 + scoreItem[j][1]));
                colors.push(vec4(1.0, 1.0, 1.0, 1.0));
            }
    }
   

    var positionBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex), gl.DYNAMIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var colorBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}


function updateEntities() {
    for (var i = shots.length - 1; i >= 0; i--) {
        shots[i][1] += 0.01;

        if (shots[i][1] >= 1.1) {
            shots.splice(i, 1);
        }
    }


    if (birds.length < 6 && Math.random() < 0.01) {
        var birdY = -0.2 + Math.random() * (0.6 + 0.2);
        var birdSpeed = (Math.random() * 0.005) + 0.001;
        let birdX = 1.14;
        if (Math.random() > 0.5) birdSpeed = -birdSpeed;
        if (birdSpeed > 0) {
            birdX = -1.14;
        }
        birds.push(vec3(birdX, birdY, birdSpeed));
    }

    for (var i = birds.length - 1; i >= 0; i--) {
        birds[i][0] += birds[i][2];
        if (birds[i][0] < -1.15 || birds[i][0] > 1.15) {
            birds.splice(i, 1);
        }
    }

    for (var i = shots.length - 1; i >= 0; i--) {
        for (var j = birds.length - 1; j >= 0; j--) {
            var dx = Math.abs(shots[i][0] - birds[j][0]);
            var dy = Math.abs(shots[i][1] - birds[j][1]);

            if (dx <= 0.07 && dy <= 0.1) {
                shots.splice(i, 1);
                birds.splice(j, 1);
                score++;
                break;
            }
        }
    }
}


function setCanvasSize(canvas) {
    var size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size * 0.6;
    canvas.height = size * 0.6;
    if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}