const vertexShaderCode = [
    'precision mediump float;',
    '',
    'attribute vec3 vertPosition;',
    'attribute vec2 vertTexCoord;',
    'varying vec2 fragTexCoord;',
    'uniform mat4 mWorld;',
    'uniform mat4 mView;',
    'uniform mat4 mProj;',
    '',
    'void main(){',
    '   fragTexCoord = vertTexCoord;',
    '   gl_Position= mProj * mView * mWorld * vec4(vertPosition, 1.0);',
    '}'
].join('\n');

const fragmentShaderCode = [
    'precision mediump float;',
    '',
    'varying vec2 fragTexCoord;',
    'uniform sampler2D sampler;',
    '',
    'void main(){',
    '   gl_FragColor = texture2D(sampler, fragTexCoord);',
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
    context.enable(context.DEPTH_TEST);
    context.enable(context.CULL_FACE);

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

    let boxVertices = [
        //X,Y, Z           U,V
        // Top
        -1.0, 1.0, -1.0,   0, 0,
        -1.0, 1.0, 1.0,    0, 1,
        1.0, 1.0, 1.0,     1, 1,
        1.0, 1.0, -1.0,    1, 0,

        // Left
        -1.0, 1.0, 1.0,    0, 0,
        -1.0, -1.0, 1.0,   1, 0,
        -1.0, -1.0, -1.0,  1, 1,
        -1.0, 1.0, -1.0,   0, 1,

        // Right
        1.0, 1.0, 1.0,    1, 1,
        1.0, -1.0, 1.0,   0, 1,
        1.0, -1.0, -1.0,  0, 0,
        1.0, 1.0, -1.0,   1, 0,

        // Front
        1.0, 1.0, 1.0,    1, 1,
        1.0, -1.0, 1.0,    1, 0,
        -1.0, -1.0, 1.0,    0, 0,
        -1.0, 1.0, 1.0,    0, 1,

        // Back
        1.0, 1.0, -1.0,    0, 0,
        1.0, -1.0, -1.0,    0, 1,
        -1.0, -1.0, -1.0,    1, 1,
        -1.0, 1.0, -1.0,    1, 0,

        // Bottom
        -1.0, -1.0, -1.0,   1, 1,
        -1.0, -1.0, 1.0,    1, 0,
        1.0, -1.0, 1.0,     0, 0,
        1.0, -1.0, -1.0,    0, 1,
    ];

    let boxIndices =
        [
            // Top
            0, 1, 2,
            0, 2, 3,

            // Left
            5, 4, 6,
            6, 4, 7,

            // Right
            8, 9, 10,
            8, 10, 11,

            // Front
            13, 12, 14,
            15, 14, 12,

            // Back
            16, 17, 18,
            16, 18, 19,

            // Bottom
            21, 20, 22,
            22, 20, 23
        ];

    let boxVertexBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, boxVertexBuffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(boxVertices), context.STATIC_DRAW);

    let boxIndexBuffer = context.createBuffer();
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), context.STATIC_DRAW);

    let positionAttributeLocation = context.getAttribLocation(shaderProgram, "vertPosition");
    let texCoordAttributeLocation = context.getAttribLocation(shaderProgram, "vertTexCoord");

    context.vertexAttribPointer(
        positionAttributeLocation, //Attribute location
        3, //number of elements per Attribute
        context.FLOAT, //type of elements
        false, //normalization
        5*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //offset
    );

    context.vertexAttribPointer(
        texCoordAttributeLocation, //Attribute location
        2, //number of elements per Attribute
        context.FLOAT, //type of elements
        false, //normalization
        5*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex element
        3*Float32Array.BYTES_PER_ELEMENT //offset
    );

    context.enableVertexAttribArray(positionAttributeLocation);
    context.enableVertexAttribArray(texCoordAttributeLocation);

    //
    // Create texture
    //

    let boxTexture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, boxTexture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);

    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, document.getElementById("crate-image"));

    context.bindTexture(context.TEXTURE_2D, null);

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
    let xRotationMatrix = new Float32Array(16);
    let yRotationMatrix = new Float32Array(16);

    let identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    let angle = 0;

    let loop = function(){
        angle = performance.now() /1000/6*2*Math.PI;
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0,1,0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1,0,0]);

        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

        context.uniformMatrix4fv(matWorldUniformLocation, context.FALSE, worldMatrix);

        context.clear(context.DEPTH_BUFFER_BIT | context.COLOR_BUFFER_BIT);

        context.bindTexture(context.TEXTURE_2D, boxTexture);
        context.activeTexture(context.TEXTURE0);

        context.drawElements(
            context.TRIANGLES,
            boxIndices.length,
            context.UNSIGNED_SHORT,
            0
        );
        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

}