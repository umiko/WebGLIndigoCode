precision mediump float;

varying vec3 vertexForFrag;
varying vec3 normalForFrag;
varying vec2 texCoordForFrag;

uniform samplerCube lightShadowMap;
uniform vec2 shadowClipNearFar;

uniform sampler2D texSampler;
uniform vec3 lightPos;
uniform vec3 viewPos;

vec3 towardsLightDirectionCalc(vec3 lightPos){
    return normalize(lightPos-vertexForFrag);
}

vec3 ambientCalc(float ambientStrength, vec3 ambientColor){
    return ambientStrength * ambientColor;
}

vec3 diffuseCalc(vec3 lightDirection, vec3 lightColor){
    float diff = max(dot(normalForFrag, lightDirection), 0.0);
    return diff * lightColor;
}

vec3 specularCalc(vec3 halfwayDir, vec3 lightColor, float shininess){
    float spec = pow(max(dot(normalForFrag, halfwayDir), 0.0), shininess);
    return spec*lightColor;
}

void main(){
    vec3 lightColor = vec3(1, 1, 1);
    vec3 viewDir = normalize(viewPos-vertexForFrag);
    vec3 towardsLightDirection = towardsLightDirectionCalc(lightPos);
    vec3 halfwayDir = normalize(towardsLightDirection+viewDir);
    float shininess = 32.0;

    float lightToFragment = (length(vertexForFrag - lightPos) - shadowClipNearFar.x)/(shadowClipNearFar.y - shadowClipNearFar.x);
	float shadowMapValue = textureCube(lightShadowMap, -towardsLightDirection).r;    //calculate or define necessary "globals"


    //ambient
    vec3 lightingResult = ambientCalc(.1, lightColor);

    if(shadowMapValue>=lightToFragment){
        lightingResult += diffuseCalc(towardsLightDirection, lightColor);
        lightingResult += specularCalc(halfwayDir, lightColor, shininess);
    }
    //combine
    vec3 result = lightingResult * texture2D(texSampler, texCoordForFrag).xyz;
    gl_FragColor = vec4(result, 1.0);
}

