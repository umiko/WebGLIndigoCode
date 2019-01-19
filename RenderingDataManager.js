///This Class is supposed to manage the drawable object data, such as meshes, textures, shaders and their buffers and whatnot
class RenderingDataManager{
    constructor(context){
        this.context = context;
        this.currentShader = null;
        this.drawableObjects = null;
    }

    loadShaderCodeFromFiles(ShaderFilePathArray){
        this.shaderCodeArray = Array(ShaderFilePathArray.length);
        ShaderFilePathArray.map(filePath => loadTextResourceFromFile(filePath,function(err, result){
            if(err)
                console.error(err);
            else
                this.shaderCodeArray.push(result);
        }));
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
}