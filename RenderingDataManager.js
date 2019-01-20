///This Class is supposed to manage the drawable object data, such as meshes, textures, shaders and their buffers and whatnot
class RenderingDataManager{
    constructor(context){
        this.context = context;
        this.currentShader = null;
        this.drawableObjects = null;
    }

    loadShaderCodeFromFiles(ShaderFilePathArray){
        let shaderCodeArray = Array(ShaderFilePathArray.length);
        ShaderFilePathArray.map(filePath => loadTextResourceFromFile(filePath,function(err, result){
            if(err)
                console.error(err);
            else
                shaderCodeArray.push(result);
        }));
        return shaderCodeArray;
    }

    getCurrentShader(){
        return this.currentShader
    }

    setCurrentShader(shader){
        this.currentShader = shader;
    }

    #createShaderFilepathPair(vertexShaderFilePath, fragmentShaderFilePath){
        let filePair = {};
        filePair['vertexShaderFilePath'] = vertexShaderFilePath;
        filePair['fragmentShaderFilePath'] = fragmentShaderFilePath;
        return filePair;
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