class DrawableObject{
    constructor(vertexShaderPaths, fragmentShaderPaths, meshPath, texturePath){
        if(vertexShaderPaths.length !== fragmentShaderPaths.length){
            console.error("The number of Vertex and Fragment Shaders is not equal");
        }

        this.vertexShaderPaths = vertexShaderPaths;
        this.fragmentShaderPaths = fragmentShaderPaths;
        this.vertexShaderCode = Array(vertexShaderPaths.length);
        this.fragmentShaderCode = Array(fragmentShaderPaths.length);
        this.shaders = Array(vertexShaderPaths.length);
        this.meshPath = meshPath;
        this.texturePath = texturePath;
    }

    initializeObject(){
        let that = this;

        console.log(3);
    }

    addShader(shader){
        this.shaders.push(shader);
    }
}