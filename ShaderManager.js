class DrawableObjectShaderManager{
    constructor(DrawableObject){
        this.owner = DrawableObject;
        this.currentShader = null;
    }

    loadShaderCodeFromFiles(ShaderFilePathArray){
        this.shaderCodeArray = Array(ShaderFilePathArray.length);
        ShaderFilePathArray.map(filePath => loadTextResource(filePath,function(err, result){
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

    static createShaderFilepathPair(vertexShaderFilePath, fragmentShaderFilePath){
        let filePair = {};
        filePair['vertexShaderFilePath'] = vertexShaderFilePath;
        filePair['fragmentShaderFilePath'] = fragmentShaderFilePath;
        return filePair;
    }
}