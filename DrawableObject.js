class DrawableObject{
    constructor(vertexShaderPaths, fragmentShaderPaths, meshPath, texturePath){
        if(vertexShaderPaths.length !== fragmentShaderPaths.length){
            console.error("The number of Vertex and Fragment Shaders is not equal");
        }

        this.vertexShaderPaths = vertexShaderPaths;
        this.fragmentShaderPaths = fragmentShaderPaths;
        this.vertexShaderCode = Array(vertexShaderPaths.length);
        this.fragmentShaderCode = Array(fragmentShaderPaths.length);
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
                return result;
            }
        });
        async.map(this.fragmentShaderPaths, loadTextResource, function(err, result){
            if(err){
                console.log(err);
            }
            else{
                that.fragmentShaderCode.push(result);
            }
        });
        console.log(3);
    }
}