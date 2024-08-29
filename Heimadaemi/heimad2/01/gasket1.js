"use strict";

var gl;
var points;
var NumPoints = 5000;

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // Initialize the vertices for the Sierpinski Gasket
  var vertices = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];

  // Set up event listeners for checkboxes
  document.getElementById("option1").addEventListener("change", updatePoints);
  document.getElementById("option2").addEventListener("change", updatePoints);

  function updatePoints() {
    // Initialize the points array
    points = [];

    var p;
    if (document.getElementById("option1").checked) {
      // If option1 is checked, use (100, 100) as the initial point
      p = vec2(100, 100);
    } else {
      // Otherwise, use the default logic
      var u = add(vertices[0], vertices[1]);
      var v = add(vertices[0], vertices[2]);
      p = scale(0.25, add(u, v));
    }

    points.push(p);

    // Compute new points

    var j;
    for (var i = 0; points.length < NumPoints; ++i) {
      if (document.getElementById("option2").checked) {
        if (Math.random() < 0.9) {
          j = 0;
        } else j = Math.floor(Math.random() * 2) + 1;
      } else j = Math.floor(Math.random() * 3);

      p = add(points[i], vertices[j]);
      p = scale(0.5, p);
      points.push(p);

    }

    // Reconfigure WebGL and re-render the scene
    render();
  }

  function render() {
    // Configure WebGL viewport and clear the canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate shader variables with the data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Draw the points
    gl.drawArrays(gl.POINTS, 0, points.length);
  }

  // Initial render
  updatePoints();
};
