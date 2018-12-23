function LoadResources(){
    loadTextResource('./resource/shader/shader.vert', function (vertErr, vertText) {
        if(vertErr){
            alert("Fatal Error getting Vertex shader");
            console.error(vertErr);
        }else{
            console.log("vert loaded");
            loadTextResource('./resource/shader/shader.frag', function (fragErr, fragText) {
                if (fragErr) {
                    alert("Fatal Error getting Fragment shader");
                    console.error(fragErr);
                }else{
                    console.log("frag loaded");
                    loadJSONResource('./resource/model/susan.json', function (modelErr, modelObj) {
                        if(modelErr){
                            alert("Fatal Error getting model");
                            console.error(modelErr);
                        }else{
                            console.log("model loaded");
                            loadImage('./resource/texture/susanTexture.png', function (textureErr, texture) {
                                if(textureErr){
                                    alert("Fatal Error getting texture");
                                    console.error(textureErr);
                                }else{
                                    console.log("texture loaded");
                                    RunWebGL(vertText, fragText, modelObj, texture);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function RunWebGL(vertText, fragText, susanModel, texture){
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

    context.shaderSource(vertexShader, vertText);
    context.shaderSource(fragmentShader, fragText);

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

    let susanVertices = susanModel.meshes[0].vertices;
    let susanTexCoords = susanModel.meshes[0].texturecoords[0];
    let susanIndices = [].concat.apply([], susanModel.meshes[0].faces);

    let susanVertexBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, susanVertexBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(susanVertices), context.STATIC_DRAW);

    let susanTexCoordVertexBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(susanTexCoords), context.STATIC_DRAW);

    let susanIndexBuffer = context.createBuffer();
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, susanIndexBuffer);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), context.STATIC_DRAW);

    context.bindBuffer(context.ARRAY_BUFFER, susanVertexBufferObject)
    let vertAttributeLocation = context.getAttribLocation(shaderProgram, "vertPosition");
    context.vertexAttribPointer(
        vertAttributeLocation, //Attribute location
        3, //number of elements per Attribute
        context.FLOAT, //type of elements
        false, //normalization
        3*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //offset
    );
    context.enableVertexAttribArray(vertAttributeLocation);

    context.bindBuffer(context.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
    let texCoordAttributeLocation = context.getAttribLocation(shaderProgram, "vertTexCoord");
    context.vertexAttribPointer(
        texCoordAttributeLocation, //Attribute location
        2, //number of elements per Attribute
        context.FLOAT, //type of elements
        false, //normalization
        2*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex element
        0*Float32Array.BYTES_PER_ELEMENT //offset
    );
    context.enableVertexAttribArray(texCoordAttributeLocation);

    //
    // Create texture
    //

    let susanTexture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, susanTexture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);

    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, texture);

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
        mat4.rotate(xRotationMatrix, identityMatrix, angle/8, [1,0,0]);
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

        context.uniformMatrix4fv(matWorldUniformLocation, context.FALSE, worldMatrix);

        context.clear(context.DEPTH_BUFFER_BIT | context.COLOR_BUFFER_BIT);

        context.bindTexture(context.TEXTURE_2D, susanTexture);
        context.activeTexture(context.TEXTURE0);

        context.drawElements(
            context.TRIANGLES,
            susanIndices.length,
            context.UNSIGNED_SHORT,
            0
        );
        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

}