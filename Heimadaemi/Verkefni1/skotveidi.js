var canvas;
var gl;

var program;

var mouseX;             // Old value of x-coordinate  
var movement = false;   // Do we move the paddle?
var vertex = [];
var birds = [];
var gun = [
    vec2( -0.1, -0.9 ), 
    vec2( 0, -0.80 ), 
    vec2(  0.1, -0.9 ) 
];
var shots = [];
var gunColor = vec4(1.0, 0.5, 0.0, 1.0);
var birdColor = vec4(0.0, 1.0, 0.0, 1.0);
var shotColor = vec4(0.0, 0.0, 0.0, 1.0);

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            for(i=0; i<3; i++) {
                gun[i][0] += xmove;
            }
        }
    } );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    drawPointToBuffer();
    gl.drawArrays( gl.TRIANGLES, 0, 3);
    window.requestAnimFrame(render);
}

function drawPointToBuffer(){
    vertex = [];
    var colors = [];

    for(var i = 0; i < gun.length; i++){
        vertex.push(gun[i]);
        colors.push(gunColor);

    }
      // Load the data into the GPU
      var bufferId = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(vertex), gl.DYNAMIC_DRAW );
  
      // Associate out shader variables with our data buffer
      var vPosition = gl.getAttribLocation( program, "vPosition" );
      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      var colorBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW );

      var vColor= gl.getAttribLocation( program, "vColor" );
      gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vColor );

}

