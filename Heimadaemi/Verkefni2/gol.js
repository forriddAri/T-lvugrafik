var canvas;
var gl;

var points = [];
var colors = [];

var movement = false;
var spinX = 30;
var spinY = 45;
var origX;
var origY;

var gridSize = 10;
var grid = createGrid(gridSize);
var lastUpdateTime = 0;


var prevGrid = copyGrid(grid);

var animationDuration = 1000;
var fullRotation = Math.PI * 2;

var updateInterval = 2500;

var zoom = 25.0; // Initial zoom level (distance from the scene)

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', function () {
        grid = createGrid(gridSize);
        prevGrid = copyGrid(grid);
        lastUpdateTime = Date.now();
    });

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(25 / 255, 25 / 255, 112 / 255, 1.0); 

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

    // Event listeners for mouse
    canvas.addEventListener("mousedown", function (e) {
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
    });

    canvas.addEventListener("mouseup", function (e) {
        movement = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (movement) {
            spinY = (spinY - (origX - e.offsetX) * 0.2) % 360;
            spinX = (spinX - (origY - e.offsetY) * 0.2) % 360;

            if (spinX < -90) {
                spinX = -90;
            } else if (spinX > 90) {
                spinX = 90;
            }
            origX = e.offsetX;
            origY = e.offsetY;
        }
    });

    // Touch event listeners
    canvas.addEventListener("touchstart", function (e) {
        movement = true;
        origX = e.touches[0].clientX;
        origY = e.touches[0].clientY;
    });

    canvas.addEventListener("touchmove", function (e) {
        if (movement) {
            var deltaX = e.touches[0].clientX - origX;
            var deltaY = e.touches[0].clientY - origY;
            spinY += (deltaX * 0.5) % 360;
            spinX += (deltaY * 0.5) % 360;

            if (spinX < -90) spinX = -90;
            if (spinX > 90) spinX = 90;

            origX = e.touches[0].clientX;
            origY = e.touches[0].clientY;
        }
    });

    canvas.addEventListener("touchend", function (e) {
        movement = false;
    });

    canvas.addEventListener("wheel", function (e) {
        e.preventDefault();
        zoom += e.deltaY * 0.05; // Adjust the 0.05 value to control zoom speed
        if (zoom < 5.0) zoom = 5.0;     // Set minimum zoom level
        if (zoom > 100.0) zoom = 100.0; // Set maximum zoom level
    });

    window.addEventListener("resize", function () {
        setCanvasSize(canvas);
    });

    render();

    setInterval(updateGrid, updateInterval);

    setCanvasSize(canvas);
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

    // Vertex color assigned by the index of the face
    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[a]);
    }
}

function createGrid(size) {
    let grid = [];
    for (let x = 0; x < size; x++) {
        grid[x] = [];
        for (let y = 0; y < size; y++) {
            grid[x][y] = [];
            for (let z = 0; z < size; z++) {
                grid[x][y][z] = Math.random() > 0.7 ? 1 : 0;
            }
        }
    }
    return grid;
}

function copyGrid(grid) {
    let newGrid = [];
    for (let x = 0; x < gridSize; x++) {
        newGrid[x] = [];
        for (let y = 0; y < gridSize; y++) {
            newGrid[x][y] = [];
            for (let z = 0; z < gridSize; z++) {
                newGrid[x][y][z] = grid[x][y][z];
            }
        }
    }
    return newGrid;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var aspectRatio = canvas.width / canvas.height;
    var fov = 45;
    var near = 0.1;
    var far = 100.0;
    var projectionMatrix = perspective(fov, aspectRatio, near, far);

    var eye = vec3(0.0, 0.0, zoom); // Use the zoom variable here
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    var viewMatrix = lookAt(eye, at, up);

    var globalTransform = mult(projectionMatrix, viewMatrix);

    globalTransform = mult(globalTransform, rotateX(spinX));
    globalTransform = mult(globalTransform, rotateY(spinY));

    var currentTime = Date.now();

    if (currentTime - lastUpdateTime < animationDuration) {
        var elapsed = (currentTime - lastUpdateTime) % animationDuration;
        var progress = elapsed / animationDuration;
        renderGrid(globalTransform, progress, true);
    } else {
        renderGrid(globalTransform, 1, false);
    }

    requestAnimationFrame(render);
}

function countNeighbors(x, y, z) {
    let neighbors = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (i === 0 && j === 0 && k === 0) continue;
                let nx = x + i;
                let ny = y + j;
                let nz = z + k;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && nz >= 0 && nz < gridSize) {
                    neighbors += grid[nx][ny][nz];
                }
            }
        }
    }
    return neighbors;
}

function updateGrid() {
    prevGrid = copyGrid(grid);

    let newGrid = createEmptyGrid(gridSize);

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                let neighbors = countNeighbors(x, y, z);

                if (grid[x][y][z] === 1) {
                    if (neighbors >= 5 && neighbors <= 7) {
                        newGrid[x][y][z] = 1;
                    } else {
                        newGrid[x][y][z] = 0;
                    }
                } else {
                    if (neighbors === 6) {
                        newGrid[x][y][z] = 1;
                    } else {
                        newGrid[x][y][z] = 0;
                    }
                }
            }
        }
    }

    grid = newGrid;
    lastUpdateTime = Date.now();
}

function renderGrid(globalTransform, progress, animate) {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                var isPrevActive = prevGrid[x][y][z] === 1;
                var isNewActive = grid[x][y][z] === 1;
                var isAnimating = isPrevActive !== isNewActive;

                if (animate && isAnimating) {
                    var scale = isNewActive ? progress : 1 - progress;
                    drawAnimatedCube(x, y, z, globalTransform, scale);
                } else if (isNewActive) {
                    drawCube(x, y, z, globalTransform);
                }
            }
        }
    }
}


function drawCube(x, y, z, globalTransform) {
    let modelMatrix = mat4();

    let spacing = 1.1;
    let centerOffset = (gridSize - 1) / 2;
    modelMatrix = mult(modelMatrix, translate(
        (x - centerOffset) * spacing,
        (y - centerOffset) * spacing,
        (z - centerOffset) * spacing
    ));

    let transform = mult(globalTransform, modelMatrix);

    gl.uniformMatrix4fv(matrixLoc, false, flatten(transform));

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

// Get references to the slider and value display
const shakeSlider = document.getElementById('shakeSlider');
const sliderValueDisplay = document.getElementById('sliderValue');

// Default shake multiplier
var shakeMultiplier = 1.0;

// Event listener for slider changes
shakeSlider.addEventListener('input', function () {
    shakeMultiplier = parseFloat(shakeSlider.value);
    sliderValueDisplay.textContent = shakeMultiplier.toFixed(1);
});

function drawAnimatedCube(x, y, z, globalTransform, scale) {
    let modelMatrix = mat4();

    let spacing = 1.1;
    let centerOffset = (gridSize - 1) / 2;

    // Introduce random shaking for the x, y, z positions
    let baseShakeAmount = 0.05; // Base shaking value
    let shakeX = (Math.random() - 0.5) * baseShakeAmount * shakeMultiplier; // Multiply by shakeMultiplier
    let shakeY = (Math.random() - 0.5) * baseShakeAmount * shakeMultiplier; // Multiply by shakeMultiplier
    let shakeZ = (Math.random() - 0.5) * baseShakeAmount * shakeMultiplier; // Multiply by shakeMultiplier

    // Apply the shaking effect and translation
    modelMatrix = mult(modelMatrix, translate(
        (x - centerOffset) * spacing + shakeX,
        (y - centerOffset) * spacing + shakeY,
        (z - centerOffset) * spacing + shakeZ
    ));

    // Apply scaling
    modelMatrix = mult(modelMatrix, scalem(scale * 0.95, scale * 0.95, scale * 0.95));

    let finalTransform = mult(globalTransform, modelMatrix);

    gl.uniformMatrix4fv(matrixLoc, false, flatten(finalTransform));

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function createEmptyGrid(size) {
    let grid = [];
    for (let x = 0; x < size; x++) {
        grid[x] = [];
        for (let y = 0; y < size; y++) {
            grid[x][y] = [];
            for (let z = 0; z < size; z++) {
                grid[x][y][z] = 0;
            }
        }
    }
    return grid;
}


function setCanvasSize(canvas) {
    var size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.8);

    var dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}
