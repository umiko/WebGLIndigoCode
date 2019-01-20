///This Class is supposed to manage the drawable object data, such as meshes, textures, shaders and their buffers and whatnot
class RenderingDataManager{
    constructor(context){
        this.context = context;
        this.activeShader = null;
    }

    getCurrentShader(){
        return this.activeShader
    }

    setCurrentShader(shader){
        this.activeShader = shader;
    }



    //<editor-fold desc="Shader Compilation and Linking">

    #initializeShaderArray(vertexShaderPathArray, fragmentShaderPathArray){
        let shaderCodeArray = this.#loadShaderCodeArray(vertexShaderPathArray, fragmentShaderPathArray);
        let shaderArray = new Array(shaderCodeArray.length);
        for(let shaderArrayIndex = 0; shaderArrayIndex<shaderCodeArray.length; shaderArrayIndex++){
            shaderArray.push(this.#createShaderProgram(shaderCodeArray[shaderArrayIndex][0], shaderCodeArray[shaderArrayIndex][1]));
        }
        return shaderArray;
    }

    #loadShaderCodeArray(vertexShaderPathArray, fragmentShaderPathArray){
        this.#checkFilePathArrayLength(vertexShaderPathArray, fragmentShaderPathArray);
        let shaderCodeArray = new Array(vertexShaderPathArray.length);
        for (let shaderCodeIndex = 0; shaderCodeIndex < vertexShaderPathArray.length; shaderCodeIndex++){
            shaderCodeArray.push(this.#loadMatchingShaderCodeFiles(vertexShaderPathArray[shaderCodeIndex], fragmentShaderPathArray[shaderCodeIndex]));
        }
        return shaderCodeArray;
    }

    #checkFilePathArrayLength(vertexShaderPathArray, fragmentShaderPathArray) {
        if (vertexShaderPathArray.length !== fragmentShaderPathArray.length)
            throw new Error("Error in Shader Arguments! Vertex and Fragment");
    }

    #loadMatchingShaderCodeFiles(vertexShaderPath, fragmentShaderPath){
        let vertexShaderCode = this.loadShaderCodeFromFile(vertexShaderPath);
        let fragmentShaderCode = this.loadShaderCodeFromFile(fragmentShaderPath);
        return {vertexShaderCode, fragmentShaderCode};
    }

    loadShaderCodeFromFile(ShaderFilePath){
        loadTextResourceFromFile(ShaderFilePath, function (err, result) {
            if (err)
                throw new Error(err);
            else
                return result;
        });
    }

    #createShaderProgram(vertexCode, fragmentCode){
        let vertexShader = this.#compileShader(vertexCode, this.context.VERTEX_SHADER);
        let fragmentShader = this.#compileShader(fragmentCode, this.context.FRAGMENT_SHADER);
        let shaderProgram = this.#linkShaderProgram(vertexShader, fragmentShader);
        this.#validateShaderProgram(shaderProgram);
        return shaderProgram;
    }

    #compileShader(shaderCode, shaderType){
        let compiledShader = this.context.createShader(shaderType);
        this.context.shaderSource(compiledShader, shaderCode);
        this.context.compileShader(compiledShader);
        this.#checkShaderCompilationStatus(compiledShader);
        return compiledShader;
    }

    #linkShaderProgram(vertexShader, fragmentShader){
        let shaderProgram = this.context.createProgram();
        this.context.attachShader(shaderProgram, vertexShader);
        this.context.attachShader(shaderProgram, fragmentShader);
        this.context.linkProgram(shaderProgram);
        this.#checkProgramLinkStatus(shaderProgram);
        return shaderProgram;
    }

    //</editor-fold>

    //<editor-fold desc="Shader Validation">

    #checkShaderCompilationStatus(compiledShader){
        if(!this.context.getShaderParameter(compiledShader, this.context.COMPILE_STATUS)){
            throw new Error("Error in Shader Compilation!\n"+ this.context.getShaderInfoLog(compiledShader));
        }
    }

    #checkProgramLinkStatus(shaderProgram) {
        if(!this.context.getProgramParameter(shaderProgram, this.context.LINK_STATUS)){
            throw new Error("Error linking program!\n" + this.context.getProgramInfoLog(shaderProgram));
        }
    }

    #validateShaderProgram(shaderProgram){
        if(!this.context.getProgramParameter(shaderProgram, this.context.VALIDATE_STATUS)){
           throw new Error("Error validating program!\n" + this.context.getProgramInfoLog(shaderProgram));
        }
    }
    //</editor-fold>

}