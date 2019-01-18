class ShaderManager{
    constructor(DrawableObject){
        this.owner = DrawableObject;
    }

    loadShaderCodeFromFiles(ShaderFilePathArray){
        this.shaderCodeArray = Array(ShaderFilePathArray.length);
        ShaderFilePathArray.map(filePath => loadTextResource(filePath,function(err, result){
            if(err)
                console.error(err);
            else
                shaderCodeArray.push(result);
        }));
        return shaderCodeArray;
    }
}