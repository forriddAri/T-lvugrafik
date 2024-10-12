var canvas;
var gl;

var points = [];
var colors = [];
var cBuffer;
var vBuffer

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

var shakeMultiplier = 1.0;

var zoom = 25.0; 

var vertexColors = [
    [0.3, 0.5, 0.7, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [0.0, 0.275, 0.678, 1.0],
    [0.718, 0.071, 0.204, 1.0],
    [1.0, 0.835, 0.0, 1.0],
    [0.0, 0.608, 0.282, 1.0],
    [1.0, 0.345, 0.0, 1.0],
    [0.2, 0.8, 0.9, 1.0]
];

window.onload = function() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    const shakeSlider = document.getElementById('shakeSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');

    cBuffer = gl.createBuffer();
    vBuffer = gl.createBuffer();

    shakeSlider.addEventListener('input', function () {
        shakeMultiplier = parseFloat(shakeSlider.value);
        sliderValueDisplay.textContent = shakeMultiplier.toFixed(1);
    });

    const gridSizeSlider = document.getElementById('gridSizeSlider');
    const gridSizeValue = document.getElementById('gridSizeValue');

    gridSizeSlider.addEventListener('input', function () {
        gridSize = parseInt(gridSizeSlider.value);
        gridSizeValue.textContent = gridSize;
        grid = createGrid(gridSize);
        prevGrid = copyGrid(grid);
    });

    canvas.addEventListener("wheel", function (e) {
        e.preventDefault();
        zoom += e.deltaY * 0.05;
        if (zoom < 5.0) zoom = 5.0;
        if (zoom > 100.0) zoom = 100.0;
    });

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

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    const colorSchemeSelect = document.getElementById('colorSchemeSelect');

    colorSchemeSelect.addEventListener('change', function () {
        const selectedScheme = colorSchemeSelect.value;
        updateColorScheme(selectedScheme);
    });

    matrixLoc = gl.getUniformLocation(program, "transform");

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

    window.addEventListener("resize", function () {
        setCanvasSize(canvas);
    });

    render();

    setInterval(updateGrid, updateInterval);

    setCanvasSize(canvas);
    window.addEventListener('resize', function () {
        setCanvasSize(canvas);
    });
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

function updateColorScheme(scheme) {
    switch (scheme) {
        case "pastels":
            vertexColors = [
                [0.9, 0.6, 0.6, 1.0],
                [0.9, 0.7, 0.5, 1.0],
                [0.9, 0.9, 0.6, 1.0],
                [0.6, 0.9, 0.6, 1.0],
                [0.6, 0.6, 0.9, 1.0],
                [0.7, 0.6, 0.9, 1.0],
                [0.8, 0.6, 0.9, 1.0],
                [0.9, 0.6, 0.6, 1.0]
            ];
            break;
        case "grayscale":
            vertexColors = [
                [0.2, 0.2, 0.2, 1.0],
                [0.3, 0.3, 0.3, 1.0],
                [0.4, 0.4, 0.4, 1.0],
                [0.5, 0.5, 0.5, 1.0],
                [0.6, 0.6, 0.6, 1.0],
                [0.7, 0.7, 0.7, 1.0],
                [0.8, 0.8, 0.8, 1.0],
                [0.9, 0.9, 0.9, 1.0]
            ];
            break;
        case "kelvin":
            vertexColors = [
                [1.0, 0.27, 0.0, 1.0],
                [1.0, 0.55, 0.0, 1.0],
                [1.0, 0.84, 0.0, 1.0],
                [1.0, 0.98, 0.8, 1.0],
                [1.0, 1.0, 1.0, 1.0],
                [0.94, 1.0, 1.0, 1.0],
                [0.68, 0.85, 0.9, 1.0],
                [0.53, 0.81, 0.92, 1.0]
            ];
            break;
        case "random":
            vertexColors = [
                [Math.random(), Math.random(), Math.random(), 1],
                [Math.random(), Math.random(), Math.random(), 1],
                [Math.random(), Math.random(), Math.random(), 1],
                [Math.random(), Math.random(), Math.random(), 1],
                [Math.random(), Math.random(), Math.random(), 1],
                [Math.random(), Math.random(), Math.random(), 1],
                [Math.random(), Math.random(), Math.random(), 1],
                [Math.random(), Math.random(), Math.random(), 1]
            ];
            break;
        default:
            vertexColors = [
                [0.3, 0.5, 0.7, 1.0],
                [1.0, 1.0, 1.0, 1.0],
                [0.0, 0.275, 0.678, 1.0],
                [0.718, 0.071, 0.204, 1.0],
                [1.0, 0.835, 0.0, 1.0],
                [0.0, 0.608, 0.282, 1.0],
                [1.0, 0.345, 0.0, 1.0],
                [0.2, 0.8, 0.9, 1.0]
            ];
    }

    colors = [];
    points = [];

    colorCube();

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var aspectRatio = canvas.width / canvas.height;
    var fov = 45;
    var near = 0.1;
    var far = 100.0;
    var projectionMatrix = perspective(fov, aspectRatio, near, far);

    var eye = vec3(0.0, 0.0, zoom);
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

function drawAnimatedCube(x, y, z, globalTransform, scale) {
    let modelMatrix = mat4();

    let spacing = 1.1;
    let centerOffset = (gridSize - 1) / 2;

    let baseShakeAmount = 0.025 * shakeMultiplier; 
    let shakeX = (Math.random() - 0.5) * baseShakeAmount * shakeMultiplier; 
    let shakeY = (Math.random() - 0.5) * baseShakeAmount * shakeMultiplier; 
    let shakeZ = (Math.random() - 0.5) * baseShakeAmount * shakeMultiplier; 

    modelMatrix = mult(modelMatrix, translate(
        (x - centerOffset) * spacing + shakeX,
        (y - centerOffset) * spacing + shakeY,
        (z - centerOffset) * spacing + shakeZ
    ));

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
    var aspectRatio = canvas.width / canvas.height;
    var width = window.innerWidth * 0.8;
    var height = window.innerHeight * 0.7;

    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    var dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}
