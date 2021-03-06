///This Class is supposed to manage the drawable object data, such as meshes, textures, shaders and their buffers and whatnot
class Model{
    constructor(){
        this.vertices = null;
        this.normals = null;
        this.textureCoordinates = null;
        this.color = null;
        this.indices = null;
    }

    addVertices(modelJSON){
        if(modelJSON.meshes[0].vertices !== 'undefined'){
            this.vertices = modelJSON.meshes[0].vertices;
        }
        else{
            throw new Error("Error in Model Data! No Vertices!");
        }
    }

    addTextureCoordinates(modelJSON){
        if(modelJSON.meshes[0].texturecoords[0] !== 'undefined'){
            this.textureCoordinates = modelJSON.meshes[0].texturecoords[0];
        }
        else{
            console.warn("Warning for Model Data! No Texture Coordinates!");
        }
    }

    addColor(modelJSON){

    }
}

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

    loadModel(modelPath){
        let that = this;
        util.loadJSONResource(modelPath, function (err, result) {
            if(err)
                throw new Error("Error loading Model!");
            else{
                that.parseModelMesh(result);
            }
        });
    }

    parseModelMesh(modelJSON) {
        let model = new Model();

        model.vertices = modelJSON.meshes[0].vertices;
        model.normals = modelJSON.meshes[0].normals;
        model.textureCoordinates = modelJSON.meshes[0].texturecoords[0];
        model.indices = [].concat.apply([], modelJSON.meshes[0].faces);
    }
    
    //<editor-fold desc="Shader Compilation and Linking">

    initializeShaderArray(vertexShaderPathArray, fragmentShaderPathArray){
        let shaderCodeArray = this.loadShaderCodeArray(vertexShaderPathArray, fragmentShaderPathArray);
        let shaderArray = [];
        for(let shaderArrayIndex = 0; shaderArrayIndex<shaderCodeArray.length; shaderArrayIndex++){
            shaderArray.push(this.createShaderProgram(shaderCodeArray[shaderArrayIndex][0], shaderCodeArray[shaderArrayIndex][1]));
        }
        return shaderArray;
    }

    loadShaderCodeArray(vertexShaderPathArray, fragmentShaderPathArray){
        this.checkFilePathArrayLength(vertexShaderPathArray, fragmentShaderPathArray);
        // let shaderCodeArray = [];
        // for (let shaderCodeIndex = 0; shaderCodeIndex < vertexShaderPathArray.length; shaderCodeIndex++){
        //     let matchingCodeFiles = this.loadMatchingShaderCodeFiles(vertexShaderPathArray[shaderCodeIndex], fragmentShaderPathArray[shaderCodeIndex]);
        //     shaderCodeArray.push(matchingCodeFiles);
        // }
        // console.log(shaderCodeArray[0]);
        //
        // return shaderCodeArray;

        const promises = vertexShaderPathArray
            .map((vertexShaderPath, i) => [vertexShaderPath, fragmentShaderPathArray[i]])
            .map(paths => this.loadMatchingShaderCodeFiles(...paths));

        return Promise.all(promises);
    }

    checkFilePathArrayLength(vertexShaderPathArray, fragmentShaderPathArray) {
        if (vertexShaderPathArray.length !== fragmentShaderPathArray.length)
            throw new Error("Error in Shader Arguments! Vertex and Fragment");
    }

    loadMatchingShaderCodeFiles(vertexShaderPath, fragmentShaderPath){
        // console.log(1);
        // let vertexShaderCode;
        // let fragmentShaderCode;
        // let obj = this.loadShaderCodeFromFile(vertexShaderPath).then(async result => {
        //     vertexShaderCode = result;
        //     console.log(2);
        //     //console.log(vertexShaderCode);
        //     await this.loadShaderCodeFromFile(fragmentShaderPath).then(result => {
        //         fragmentShaderCode = result;
        //         console.log(3);
        //         //console.log(fragmentShaderCode);
        //     });
        // }).then(()=>{return {vertexShaderCode, fragmentShaderCode};});
        // console.log(4);
        // //console.log(obj);
        // return obj;
        //let vertexShaderCode, fragmentShaderCode;
        const promises = [vertexShaderPath, fragmentShaderPath]
            .map(path => this.loadShaderCodeFromFile(path));
        return Promise.all(promises).then(([vertexShaderCode, fragmentShaderCode]) => {
            return {vertexShaderCode, fragmentShaderCode};
        });
    }

    loadShaderCodeFromFile(ShaderFilePath){
        return util.loadTextResourceFromFile(ShaderFilePath);

        // util.loadTextResourceFromFile(ShaderFilePath, function (err, result) {
            //     if (err)
            //         throw new Error(err);
            //     else
            //         return result;
            // });
        //});
    }

    createShaderProgram(vertexCode, fragmentCode){
        let vertexShader = this.compileShader(vertexCode, this.context.VERTEX_SHADER);
        let fragmentShader = this.compileShader(fragmentCode, this.context.FRAGMENT_SHADER);
        let shaderProgram = this.linkShaderProgram(vertexShader, fragmentShader);
        this.validateShaderProgram(shaderProgram);
        return shaderProgram;
    }

    compileShader(shaderCode, shaderType, callback){
        let compiledShader = this.context.createShader(shaderType);
        this.context.shaderSource(compiledShader, shaderCode);
        this.context.compileShader(compiledShader);
        this.checkShaderCompilationStatus(compiledShader);
        callback(null, compiledShader);
    }

    linkShaderProgram(vertexShader, fragmentShader){
        let shaderProgram = this.context.createProgram();
        this.context.attachShader(shaderProgram, vertexShader);
        this.context.attachShader(shaderProgram, fragmentShader);
        this.context.linkProgram(shaderProgram);
        this.checkProgramLinkStatus(shaderProgram);
        return shaderProgram;
    }

    //</editor-fold>

    //<editor-fold desc="Shader Validation">

    checkShaderCompilationStatus(compiledShader){
        if(!this.context.getShaderParameter(compiledShader, this.context.COMPILE_STATUS)){
            throw new Error("Error in Shader Compilation!\n"+ this.context.getShaderInfoLog(compiledShader));
        }
    }

    checkProgramLinkStatus(shaderProgram) {
        if(!this.context.getProgramParameter(shaderProgram, this.context.LINK_STATUS)){
            throw new Error("Error linking program!\n" + this.context.getProgramInfoLog(shaderProgram));
        }
    }

    validateShaderProgram(shaderProgram){
        if(!this.context.getProgramParameter(shaderProgram, this.context.VALIDATE_STATUS)){
           throw new Error("Error validating program!\n" + this.context.getProgramInfoLog(shaderProgram));
        }
    }
    //</editor-fold>

}