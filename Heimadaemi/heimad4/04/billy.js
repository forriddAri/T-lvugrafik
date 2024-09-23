/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Búum til bókstafinn H úr þremur teningum
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var wireframeMode = false;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var matrixLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "transform" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    document.getElementById("toggle-wireframe").addEventListener("click", function(){
        wireframeMode = !wireframeMode;  // Toggle wireframe mode
    });
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ .0, 1.0, 0.0, 1.0 ],  // Green right
        [ 0.0, .0, 0.0, 1.0 ],  // black bottom
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ .0, 1.0, .0, 1.0 ],  // green left
        [ 0.0, .0, .0, 1.0 ],  // black top
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
        
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    if (!movement) {
        spinX = (spinX + 0.5) % 360;  // Auto-rotate around X-axis
        spinY = (spinY + 0.5) % 360;  // Auto-rotate around Y-axis
    }
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    // Build the new shape...

    // First the right leg (extended to make a side of the shelf)
    mv1 = mult( mv, translate( -0.35, 0.0, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.1, 1.0, 0.3 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(wireframeMode ? gl.LINES : gl.TRIANGLES, 0, numVertices);

    // Then the left leg (same as before)
    mv1 = mult( mv, translate( 0.35, 0.0, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.1, 1.0, 0.3 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(wireframeMode ? gl.LINES : gl.TRIANGLES, 0, numVertices);

    // Top bar
    mv1 = mult( mv, translate( 0.0, 0.5, 0.0 ) );  // Move to the top
    mv1 = mult( mv1, scalem( 0.8, 0.1, 0.3 ) );    // Horizontal scaling
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(wireframeMode ? gl.LINES : gl.TRIANGLES, 0, numVertices);

    // Bottom bar
    mv1 = mult( mv, translate( 0.0, -0.5, 0.0 ) );  // Move to the bottom
    mv1 = mult( mv1, scalem( 0.8, 0.1, 0.3 ) );     // Horizontal scaling
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(wireframeMode ? gl.LINES : gl.TRIANGLES, 0, numVertices);

    // First middle bar
    mv1 = mult( mv, translate( 0.0, 0.2, 0.0 ) );   // Move upward
    mv1 = mult( mv1, scalem( 0.8, 0.1, 0.3 ) );     // Horizontal scaling
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(wireframeMode ? gl.LINES : gl.TRIANGLES, 0, numVertices);

    // Second middle bar
    mv1 = mult( mv, translate( 0.0, -0.2, 0.0 ) );  // Move downward
    mv1 = mult( mv1, scalem( 0.8, 0.1, 0.3 ) );     // Horizontal scaling
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(wireframeMode ? gl.LINES : gl.TRIANGLES, 0, numVertices);

    // Thin box (representing a pane at the back)
    mv1 = mult( mv, translate( 0.0, 0.0, 0.145 ) );  // Position slightly in the back (z-axis)
    mv1 = mult( mv1, scalem( 0.8, 0.9, 0.01 ) );     // Scale to create a thin, large pane
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(wireframeMode ? gl.LINES : gl.TRIANGLES, 0, numVertices);
    

    requestAnimFrame( render );
}

