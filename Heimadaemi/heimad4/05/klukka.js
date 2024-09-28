var canvas;
var gl;

var numVertices = 36;
var points = [];
var colors = [];

var movement = false;
var spinY = 180;
var spinX = 0;

var origX;
var origY;

var matrixLoc;
var secondAngle = 0;
var minuteAngle = 0;
var hourAngle = 0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    setCanvasSize(canvas);
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(123 / 255, 198 / 255, 102 / 255, 1.0);

    gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    matrixLoc = gl.getUniformLocation(program, "transform");

    //event listeners for mouse
    canvas.addEventListener("mousedown", function (e) {
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();  // Disable drag and drop
    });

    canvas.addEventListener("mouseup", function (e) {
        movement = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (movement) {
            spinY = (spinY + (origX - e.offsetX)) % 360;
            spinX = (spinX + (origY - e.offsetY)) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    });

    window.addEventListener("resize", function () {
        setCanvasSize(canvas);
    });

    render();
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}
function quad(a, b, c, d) {
    var vertices = [
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5)
    ];

    var vertexColors = [
        [0.3, 0.5, 0.7, 1.0],  // svartur
        [0.8, 0.2, 0.4, 1.0],  // rauður
        [0.1, 0.9, 0.2, 1.0],  // gulur
        [0.0, 0.3, 0.5, 1.0],  // grænn
        [0.6, 0.4, 0.8, 1.0],  // Bakgrunnur
        [0.9, 0.7, 0.1, 1.0],  // fjólublár
        [0.4, 0.6, 0.3, 1.0],  // hvítur
        [0.2, 0.8, 0.9, 1.0]   // blár
    ];

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[a]);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var aspectRatio = canvas.width / canvas.height;
    var fov = 45;
    var near = 0.1;
    var far = 100.0;
    var projectionMatrix = perspective(fov, aspectRatio, near, far);

    var eye = vec3(0.0, -1.0, -3);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, -1.0, 0.0);
    var viewMatrix = lookAt(eye, at, up);

    var mv = mult(projectionMatrix, viewMatrix);

    mv = mult(mv, rotateX(spinX));
    mv = mult(mv, rotateY(spinY));

    var currentTime = new Date();
    // millisek svo hrefyingin er smooth
    var currentSeconds = currentTime.getSeconds() + currentTime.getMilliseconds() / 1000;  
    var currentMinutes = currentTime.getMinutes() + currentSeconds / 60;  
    var currentHours = (currentTime.getHours() % 12) + currentMinutes / 60;  

    // Calculate angles based on the current time
    secondAngle = (360 - (currentSeconds * 360)) % 360;  // 360 graður á sek
    minuteAngle = (360 - ((currentMinutes + currentSeconds / 60) * 360)) % 360;  // 360 graður á min // virkar ekki T-T
    hourAngle = (360 - ((currentHours + currentMinutes / 60 + currentSeconds / 3600) * 360)) % 360;  // 360 graður á klst

    document.getElementById("clock-display").textContent = formatTime(currentHours, currentMinutes, currentSeconds);

    var mv1 = mult(mv, translate(0.0, 0.0, -0.05));
    var mv1 = mult(mv1, rotateX(180));
    mv1 = mult(mv1, scalem(1.5, 1.5, 0.01));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    var armLength = 0.5;
    var armWidth = 0.05;

    mv1 = mult(mv, rotateZ(hourAngle));
    mv1Final = mult(mv1, translate(armLength / 2, 0.0, 0.0));
    mv1Final = mult(mv1Final, scalem(armLength, armWidth, armWidth));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1Final));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    var mv2 = mv1;
    mv2 = mult(mv2, translate(armLength, 0.0, 0.0));
    mv2 = mult(mv2, rotateZ(minuteAngle));
    mv2Final = mult(mv2, translate(armLength / 2, 0.0, armWidth - 0.01));
    mv2Final = mult(mv2Final, scalem(armLength, armWidth * 0.5, armWidth * 0.5));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv2Final));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    var mv3 = mv2;
    mv3 = mult(mv3, translate(armLength, 0.0, 0.0));
    mv3 = mult(mv3, rotateZ(secondAngle));
    mv3 = mult(mv3, translate(armLength / 2, 0.0, armWidth + armWidth*0.5));
    mv3 = mult(mv3, scalem(armLength, armWidth * 0.3, armWidth * 0.5));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv3));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    requestAnimFrame(render);
    
    function formatTime(hours, minutes, seconds) {
        hours = Math.floor(hours);
        minutes = Math.floor(minutes);
        seconds = Math.floor(seconds);
        
        return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
    }
    
    function pad(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
}


function setCanvasSize(canvas) {
    var size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.8);
    canvas.width = size;
    canvas.height = size;
    if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}