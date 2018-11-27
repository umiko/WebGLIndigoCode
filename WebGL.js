const vertexShaderCode = [
    'precision mediump float;',
    '',
    'attribute vec3 vertPosition;',
    'attribute vec3 vertColor;',
    'varying vec3 fragColor;',
    'uniform mat4 mWorld;',
    'uniform mat4 mView;',
    'uniform mat4 mProj;',
    '',
    'void main(){',
    '   fragColor = vertColor;',
    '   gl_Position= mProj * mView * mWorld * vec4(vertPosition, 1.0);',
    '}'
].join('\n');

const fragmentShaderCode = [
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    '',
    'void main(){',
    '   gl_FragColor = vec4(fragColor, 1.0);',
    '}'
].join('\n');

function initWebGL(){
    console.log('Initializing WebGL...');
    let canvas = document.getElementById("viewport");
    let context = canvas.getContext('webgl');

    if(!context){
        context = canvas.getContext('experimental-webgl');
    }
    if(!context){
        console.log("shits fucked yo");
        return;
    }

    context.clearColor(.75, .85, .8, 1.0);
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

    let vertexShader = context.createShader(context.VERTEX_SHADER);
    let fragmentShader = context.createShader(context.FRAGMENT_SHADER);

    context.shaderSource(vertexShader, vertexShaderCode);
    context.shaderSource(fragmentShader, fragmentShaderCode);

    context.compileShader(vertexShader);
    if(!context.getShaderParameter(vertexShader, context.COMPILE_STATUS)){
        console.error("Error compiling vertex shader!", context.getShaderInfoLog(vertexShader));
        return;
    }

    context.compileShader(fragmentShader);
    if(!context.getShaderParameter(fragmentShader, context.COMPILE_STATUS)){
        console.error("Error compiling fragment shader!", context.getShaderInfoLog(fragmentShader));
        return;
    }

    let shaderProgram = context.createProgram();
    context.attachShader(shaderProgram, vertexShader);
    context.attachShader(shaderProgram, fragmentShader);
    context.linkProgram(shaderProgram);

    if(!context.getProgramParameter(shaderProgram, context.LINK_STATUS)){
        console.error("Error linking program!", context.getProgramInfoLog(shaderProgram));
        return;
    }

    context.validateProgram(shaderProgram);
    if(!context.getProgramParameter(shaderProgram, context.VALIDATE_STATUS)){
        console.error("Error validating program!", context.getProgramInfoLog(shaderProgram));
        return;
    }

    //
    //
    //

    let triangleVertices = [
        //X,Y, Z    R, G, B
        0.0,0.5,0.0, 1.0,1.0,0.0,
        -0.5,-0.5,0.0, 0.7, 0.0, 1.0,
        0.5,-0.5,0.0, 0.1, 1.0, 0.6
    ];

    let triangleVertexBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, triangleVertexBuffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(triangleVertices), context.STATIC_DRAW);

    let positionAttributeLocation = context.getAttribLocation(shaderProgram, "vertPosition");
    let colorAttributeLocation = context.getAttribLocation(shaderProgram, "vertColor");

    context.vertexAttribPointer(
        positionAttributeLocation, //Attribute location
        3, //number of elements per Attribute
        context.FLOAT, //type of elements
        false, //normalization
        6*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //offset
    );

    context.vertexAttribPointer(
        colorAttributeLocation, //Attribute location
        3, //number of elements per Attribute
        context.FLOAT, //type of elements
        false, //normalization
        6*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex element
        3*Float32Array.BYTES_PER_ELEMENT //offset
    );

    context.enableVertexAttribArray(positionAttributeLocation);
    context.enableVertexAttribArray(colorAttributeLocation);

    //Tell WebGL what program should have the uniforms
    context.useProgram(shaderProgram);

    let matWorldUniformLocation = context.getUniformLocation(shaderProgram,"mWorld");
    let matViewUniformLocation = context.getUniformLocation(shaderProgram,"mView");
    let matProjUniformLocation = context.getUniformLocation(shaderProgram, "mProj");

    let worldMatrix = new Float32Array(16);
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0,0,-5], [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, .1, 1000.0);

    context.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
    context.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
    context.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);

    //
    // Main loop
    //
    let identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    let angle = 0;
    let loop = function(){
        angle = performance.now() /1000/6*2*Math.PI;
        mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);

        context.uniformMatrix4fv(matWorldUniformLocation, context.FALSE, worldMatrix);

        context.clear(context.DEPTH_BUFFER_BIT | context.COLOR_BUFFER_BIT);

        context.drawArrays(
            context.TRIANGLES,
            0, //offset of vertices
            3  //how many verts to draw
        );
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);




}