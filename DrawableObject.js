class DrawableObject{
    constructor(vertexShaderPaths, fragmentShaderPaths, meshPath, texturePath){
        this.vertexShaderCode = null;
        this.vertexShaderPaths = vertexShaderPaths;
        this.fragmentShaderPaths = fragmentShaderPaths;
        this.meshPath = meshPath;
        this.texturePath = texturePath;
    }

    loadResources(){
        let that = this;
        async.map(this.vertexShaderPaths, loadTextResource, function(err, result){
            if(err){
                console.log(err);
            }
            else{
                that.vertexShaderCode.add(result);
            }
        });
    }


}