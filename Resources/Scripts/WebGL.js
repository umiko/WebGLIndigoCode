function LoadResources(){
    util.loadTextResourceFromFile('./Resources/Shaders/shader.vert', function (vertErr, vertText) {
        if(vertErr){
            alert("Fatal Error getting Vertex shader");
            console.error(vertErr);
        }else{
            console.log("vert loaded");
            util.loadTextResourceFromFile('./Resources/Shaders/shader.frag', function (fragErr, fragText) {
                if (fragErr) {
                    alert("Fatal Error getting Fragment shader");
                    console.error(fragErr);
                }else{
                    util.loadTextResourceFromFile('./Resources/Shaders/ShadowMapGenerator.frag', function (fragErr, shadowmapgenfrag) {
                        if (fragErr) {
                            alert("Fatal Error getting shadow Fragment shader");
                            console.error(fragErr);
                        }else{
                            util.loadTextResourceFromFile('./Resources/Shaders/ShadowMapGenerator.vert', function (fragErr, shadowmapgenvert) {
                                if (fragErr) {
                                    alert("Fatal Error getting shadow vert shader");
                                    console.error(fragErr);
                                } else {
                                    console.log("frag loaded");
                                    util.loadJSONResource('./Resources/Models/stanford_dragon.json', function (modelErr, modelObj) {
                                        if (modelErr) {
                                            alert("Fatal Error getting model");
                                            console.error(modelErr);
                                        } else {
                                            console.log("model loaded");
                                            util.loadImage('./Resources/Textures/jade.png', function (textureErr, texture) {
                                                if (textureErr) {
                                                    alert("Fatal Error getting texture");
                                                    console.error(textureErr);
                                                } else {
                                                    console.log("texture loaded");
                                                    util.loadImage('./Resources/Textures/crate.png', function (textureErr, floor) {
                                                        if (textureErr) {
                                                            alert("Fatal Error getting texture");
                                                            console.error(textureErr);
                                                        } else {
                                                            console.log("texture loaded");
                                                            RunWebGL(vertText, fragText, modelObj, texture, floor, shadowmapgenvert, shadowmapgenfrag);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}


var model;
//var test = new DrawableObject(['./Resources/Shaders/Shaders.vert'], ['./Resources/Shaders/Shaders.frag']);

function RunWebGL(vertText, fragText, susanModel, texture, floor, shadowmapgenvert, shadowmapgenfrag){
    //test.loadResources();
    model = susanModel;
    console.log('Initializing WebGL...');
    let canvas = document.getElementById("viewport");
    //resizeCanvas(canvas);
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
        console.error("Error compiling vertex Shaders!", context.getShaderInfoLog(vertexShader));
        return;
    }

    context.compileShader(fragmentShader);
    if(!context.getShaderParameter(fragmentShader, context.COMPILE_STATUS)){
        console.error("Error compiling fragment Shaders!", context.getShaderInfoLog(fragmentShader));
        return;
    }

    let shaderProgram = context.createProgram();
    context.attachShader(shaderProgram, vertexShader);
    context.attachShader(shaderProgram, fragmentShader);
    context.linkProgram(shaderProgram);

    let shadowVertexShader = context.createShader(context.VERTEX_SHADER);
    let shadowFragmentShader = context.createShader(context.FRAGMENT_SHADER);

    context.shaderSource(shadowVertexShader, shadowmapgenvert);
    context.shaderSource(shadowFragmentShader, shadowmapgenfrag);

    context.compileShader(shadowVertexShader);
    if(!context.getShaderParameter(shadowVertexShader, context.COMPILE_STATUS)){
        console.error("Error compiling shadow vertex Shaders!", context.getShaderInfoLog(shadowVertexShader));
        return;
    }

    context.compileShader(shadowFragmentShader);
    if(!context.getShaderParameter(shadowFragmentShader, context.COMPILE_STATUS)){
        console.error("Error compiling shadow fragment Shaders!", context.getShaderInfoLog(shadowFragmentShader));
        return;
    }

    let ShadowMapGeneratorProgram = context.createProgram();
    context.attachShader(ShadowMapGeneratorProgram, shadowVertexShader);
    context.attachShader(ShadowMapGeneratorProgram, shadowFragmentShader);
    context.linkProgram(ShadowMapGeneratorProgram);


    if(!context.getProgramParameter(shaderProgram, context.LINK_STATUS)){
        console.error("Error linking program!", context.getProgramInfoLog(shaderProgram));
        return;
    }

    context.validateProgram(shaderProgram);
    if(!context.getProgramParameter(shaderProgram, context.VALIDATE_STATUS)){
        console.error("Error validating program!", context.getProgramInfoLog(shaderProgram));
        return;
    }

    ShadowMapGeneratorProgram.uniforms = {
        mProj : context.getUniformLocation(ShadowMapGeneratorProgram, "mProj"),
        mView : context.getUniformLocation(ShadowMapGeneratorProgram, "mView"),
        mWorld : context.getUniformLocation(ShadowMapGeneratorProgram, "mWorld"),
        shadowClipNearFar : context.getUniformLocation(ShadowMapGeneratorProgram, "shadowClipNearFar"),
        lightPosition : context.getUniformLocation(ShadowMapGeneratorProgram, "lightPosition")

    };

    ShadowMapGeneratorProgram.attribs = {
        vertPosition : context.getAttribLocation(ShadowMapGeneratorProgram, "vertPosition")
    };



    let susanVertices = susanModel.meshes[0].vertices;
    let susanNormals = susanModel.meshes[0].normals;
    //let susanTexCoords = susanModel.meshes[0].texturecoords[0];
    //the dragon has no Texcoords, give it an empty array so it can use the color Textures
    let susanTexCoords = Array(susanVertices.length);

    let susanIndices = [].concat.apply([], susanModel.meshes[0].faces);

    //<editor-fold desc="floor data">

    let floorVertices = [
        10.0, -1.0, 10.0,
        -10.0, -1.0, 10.0,
        10.0,-1.0,-10.0,
        -10.0,-1.0,-10.0
    ];

    let floorNormals = [
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0
    ];

    let floorTexCoords = [
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];

    let floorIndices = [
        0,2,1,1,2,3
    ];

    //</editor-fold>

    //<editor-fold desc="buffer creation">

    let susanVertexBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, susanVertexBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(susanVertices), context.STATIC_DRAW);

    let susanNormalBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, susanNormalBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(susanNormals), context.STATIC_DRAW);

    let susanTexCoordBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, susanTexCoordBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(susanTexCoords), context.STATIC_DRAW);

    let susanIndexBufferObject = context.createBuffer();
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), context.STATIC_DRAW);


    let floorVertexBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, floorVertexBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(floorVertices), context.STATIC_DRAW);

    let floorNormalBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, floorNormalBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(floorNormals), context.STATIC_DRAW);

    let floorTexCoordBufferObject = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, floorTexCoordBufferObject);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(floorTexCoords), context.STATIC_DRAW);

    let floorIndexBufferObject = context.createBuffer();
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, floorIndexBufferObject);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), context.STATIC_DRAW);

    //</editor-fold>

    let vertAttributeLocation = context.getAttribLocation(shaderProgram, "vertPosition");
    let normalAttributeLocation = context.getAttribLocation(shaderProgram, "vertexNormal");
    let texCoordAttributeLocation = context.getAttribLocation(shaderProgram, "vertTexCoord");

    //
    // Create Textures
    //

    let shadowMapCubeTexture = context.createTexture();
    context.bindTexture(context.TEXTURE_CUBE_MAP, shadowMapCubeTexture);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_WRAP_S, context.MIRRORED_REPEAT);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_WRAP_T, context.MIRRORED_REPEAT);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MAG_FILTER, context.LINEAR);

    for(let i = 0; i<6; i++ ){
        context.texImage2D(context.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, context.RGBA, 512, 512, 0, context.RGBA, context.UNSIGNED_BYTE, null);
    }

    let shadowMapFrameBuffer = context.createFramebuffer();
    context.bindFramebuffer(context.FRAMEBUFFER, shadowMapFrameBuffer);

    let shadowMapRenderBuffer = context.createRenderbuffer();
    context.bindRenderbuffer(context.RENDERBUFFER, shadowMapRenderBuffer);
    context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT16, 512, 512);

    context.bindTexture(context.TEXTURE_CUBE_MAP, null);
    context.bindRenderbuffer(context.RENDERBUFFER, null);
    context.bindFramebuffer(context.FRAMEBUFFER, null);

    let susanTexture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, susanTexture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, texture);

    let floorTexture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, floorTexture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);

    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, floor);

    context.bindTexture(context.TEXTURE_2D, null);

    let vertexArrays = [susanVertexBufferObject, floorVertexBufferObject];
    let normalArrays = [susanNormalBufferObject, floorNormalBufferObject];
    let texcoordArrays = [susanTexCoordBufferObject, floorTexCoordBufferObject];
    let indexArrays = [susanIndexBufferObject, floorIndexBufferObject];
    let textureArray = [ susanTexture, floorTexture];

    //Tell WebGL what program should have the uniforms
    context.useProgram(shaderProgram);

    let lightPosUniformLocation = context.getUniformLocation(shaderProgram, "lightPos");
    let viewPosUniformLocation = context.getUniformLocation(shaderProgram, "viewPos");
    let matWorldUniformLocation = context.getUniformLocation(shaderProgram,"mWorld");
    let matViewUniformLocation = context.getUniformLocation(shaderProgram,"mView");
    let matProjUniformLocation = context.getUniformLocation(shaderProgram, "mProj");
    let matNormUniformLocation = context.getUniformLocation(shaderProgram, "mNormal");
    let matMVPUniformLocation = context.getUniformLocation(shaderProgram, "mvp");
    let textureUniformLocation = context.getUniformLocation(shaderProgram, "texSampler");
    let lightShadowMapUniform = context.getUniformLocation(shaderProgram, "lightShadowMap");
    let shadowClipUniform = context.getUniformLocation(shaderProgram, "shadowClipNearFar");

    context.uniform1i(textureUniformLocation, 0);
    context.uniform1i(lightShadowMapUniform, 1);

    context.activeTexture(context.TEXTURE1);
    context.bindTexture(context.TEXTURE_CUBE_MAP, shadowMapCubeTexture);

    let lightPos = new Float32Array([0.0, 15.0, 0.0]);
    let viewPos = new Float32Array([0,5,-20]);
    let worldMatrix = new Float32Array(16);
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);
    let normalMatrix = mat4.create();

    let shadowMapCameras = [
        // Positive X
        new Camera(
            lightPos,
            vec3.add(vec3.create(), lightPos, vec3.fromValues(1, 0, 0)),
            vec3.fromValues(0, -1, 0)
        ),
        // Negative X
        new Camera(
            lightPos,
            vec3.add(vec3.create(),lightPos, vec3.fromValues(-1, 0, 0)),
            vec3.fromValues(0, -1, 0)
        ),
        // Positive Y
        new Camera(
            lightPos,
            vec3.add(vec3.create(), lightPos, vec3.fromValues(0, 1, 0)),
            vec3.fromValues(0, 0, 1)
        ),
        // Negative Y
        new Camera(
            lightPos,
            vec3.add(vec3.create(), lightPos, vec3.fromValues(0, -1, 0)),
            vec3.fromValues(0, 0, -1)
        ),
        // Positive Z
        new Camera(
            lightPos,
            vec3.add(vec3.create(),lightPos, vec3.fromValues(0, 0, 1)),
            vec3.fromValues(0, -1, 0)
        ),
        // Negative Z
        new Camera(
            lightPos,
            vec3.add(vec3.create(), lightPos, vec3.fromValues(0, 0, -1)),
            vec3.fromValues(0, -1, 0)
        ),
    ];

    let shadowMapViewMatrices = [
        mat4.create(),
        mat4.create(),
        mat4.create(),
        mat4.create(),
        mat4.create(),
        mat4.create()
    ];

    let shadowMapProj = mat4.create();
    let shadowClipNearFar = vec2.fromValues(0.15, 25.0);
    mat4.perspective(
        shadowMapProj,
        glMatrix.toRadian(90),
        1.0,
        shadowClipNearFar[0],
        shadowClipNearFar[1]
    );

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, viewPos, [0,3,0], [0,1,0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, .1, 1000.0);

    context.uniform3fv(lightPosUniformLocation, lightPos);
    context.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
    context.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
    context.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);

    context.uniform3fv(viewPosUniformLocation, viewPos);

    //
    // Main loop
    //
    let xRotationMatrix = new Float32Array(16);
    let yRotationMatrix = new Float32Array(16);
    let identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    mat4.identity(xRotationMatrix);
    mat4.identity(yRotationMatrix);

    let mvp = new Float32Array(16);

    let angle = 0;

    let generateShadowMap = function(){
        context.useProgram(ShadowMapGeneratorProgram);

        context.bindTexture(context.TEXTURE_CUBE_MAP, shadowMapCubeTexture);
        context.bindFramebuffer(context.FRAMEBUFFER, shadowMapFrameBuffer);
        context.bindRenderbuffer(context.RENDERBUFFER, shadowMapRenderBuffer);

        context.viewport(0,0, 512,512);
        context.enable(context.DEPTH_TEST);
        context.enable(context.CULL_FACE);

        context.uniform2fv(ShadowMapGeneratorProgram.uniforms.shadowClipNearFar, shadowClipNearFar);
        context.uniform3fv(ShadowMapGeneratorProgram.uniforms.lightPosition, lightPos);
        context.uniformMatrix4fv(ShadowMapGeneratorProgram.uniforms.mProj, context.FALSE, shadowMapProj);

        for(let j = 0; j< shadowMapCameras.length; j++){
            context.uniformMatrix4fv(ShadowMapGeneratorProgram.uniforms.mView, context.FALSE, shadowMapCameras[j].GetViewMatrix(shadowMapViewMatrices[j]));
            context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_CUBE_MAP_POSITIVE_X+j, shadowMapCubeTexture, 0);
            context.framebufferRenderbuffer(context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, shadowMapRenderBuffer);

            context.clearColor(1,1,1,1);
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

            for (let i = 0; i<vertexArrays.length; i++) {
                //resizeCanvas(canvas);

                context.uniformMatrix4fv(ShadowMapGeneratorProgram.uniforms.mWorld, context.FALSE, worldMatrix);
                context.uniformMatrix4fv(ShadowMapGeneratorProgram.uniforms.mProj, context.FALSE, projMatrix);

                context.bindBuffer(context.ARRAY_BUFFER, vertexArrays[i]);
                context.vertexAttribPointer(
                    vertAttributeLocation, //Attribute location
                    3, //number of elements per Attribute
                    context.FLOAT, //type of elements
                    false, //normalization
                    3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
                    0 //offset
                );

                context.enableVertexAttribArray(vertAttributeLocation);

                context.bindBuffer(context.ARRAY_BUFFER, null);

                context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexArrays[i]);

                context.drawElements(
                    context.TRIANGLES,
                    i === 0 ? susanIndices.length : floorIndices.length,
                    context.UNSIGNED_SHORT,
                    0
                );
            }
        }

        context.bindFramebuffer(context.FRAMEBUFFER, null);
        context.bindRenderbuffer(context.RENDERBUFFER, null);
        context.bindTexture(context.TEXTURE_CUBE_MAP, null);


    };

    let loop = function(){

        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        mat4.rotate(yRotationMatrix, identityMatrix, angle * 1, [0, 1, 0]);
        //mat4.rotate(xRotationMatrix, identityMatrix, angle/8, [1,0,0]);
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

        mat4.invert(normalMatrix, worldMatrix);
        mat4.transpose(normalMatrix, normalMatrix);


        mat4.mul(mvp, projMatrix, viewMatrix);
        mat4.mul(mvp, mvp, worldMatrix);

        generateShadowMap();
        context.useProgram(shaderProgram);

        context.uniformMatrix4fv(matNormUniformLocation, context.FALSE, normalMatrix);
        context.uniformMatrix4fv(matWorldUniformLocation, context.FALSE, worldMatrix);
        context.uniformMatrix4fv(matViewUniformLocation, context.FALSE, viewMatrix);
        context.uniformMatrix4fv(matProjUniformLocation, context.FALSE, projMatrix);
        context.uniformMatrix4fv(matMVPUniformLocation, context.FALSE, mvp);
        context.uniform2fv(shadowClipUniform, shadowClipNearFar);
        context.uniform1i(lightShadowMapUniform, 1);
        context.activeTexture(context.TEXTURE1);
        context.bindTexture(context.TEXTURE_CUBE_MAP, shadowMapCubeTexture);

        context.viewport(0,0, canvas.width, canvas.height);

        context.clear(context.DEPTH_BUFFER_BIT | context.COLOR_BUFFER_BIT);

        for (let i = 0; i<vertexArrays.length; i++) {
            //resizeCanvas(canvas);

            context.bindBuffer(context.ARRAY_BUFFER, vertexArrays[i]);
            context.vertexAttribPointer(
                vertAttributeLocation, //Attribute location
                3, //number of elements per Attribute
                context.FLOAT, //type of elements
                false, //normalization
                3*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
                0 //offset
            );
            context.enableVertexAttribArray(vertAttributeLocation);

            context.bindBuffer(context.ARRAY_BUFFER, normalArrays[i]);
            context.vertexAttribPointer(
                normalAttributeLocation,
                3,
                context.FLOAT,
                false,
                3* Float32Array.BYTES_PER_ELEMENT,
                0
            );
            context.enableVertexAttribArray(normalAttributeLocation);

            context.bindBuffer(context.ARRAY_BUFFER, texcoordArrays[i]);
            context.vertexAttribPointer(
                texCoordAttributeLocation, //Attribute location
                2, //number of elements per Attribute
                context.FLOAT, //type of elements
                false, //normalization
                2*Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex element
                0*Float32Array.BYTES_PER_ELEMENT //offset
            );
            context.enableVertexAttribArray(texCoordAttributeLocation);

            context.bindBuffer(context.ARRAY_BUFFER, null);

            context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexArrays[i]);

            context.activeTexture(context.TEXTURE0);
            context.bindTexture(context.TEXTURE_2D, textureArray[i]);



            context.drawElements(
                context.TRIANGLES,
                i===0 ? susanIndices.length : floorIndices.length,
                context.UNSIGNED_SHORT,
                0
            );
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

var Camera = function (position, lookAt, up) {
    this.forward = vec3.create();
    this.up = vec3.create();
    this.right = vec3.create();

    this.position = position;

    vec3.subtract(this.forward, lookAt, this.position);
    vec3.cross(this.right, this.forward, up);
    vec3.cross(this.up, this.right, this.forward);

    vec3.normalize(this.forward, this.forward);
    vec3.normalize(this.right, this.right);
    vec3.normalize(this.up, this.up);
};


Camera.prototype.GetViewMatrix = function (out) {
    var lookAt = vec3.create();
    vec3.add(lookAt, this.position, this.forward);
    mat4.lookAt(out, this.position, lookAt, this.up);
    return out;
};