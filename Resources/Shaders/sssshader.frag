precision mediump float;

varying vec3 viewDir;
varying vec3 lightDir;
varying vec3 normalForFrag;
varying vec3 vertexForFrag;
varying vec2 texCoordForFrag;
varying vec3 lightPosForFrag;

uniform sampler2D texSampler;

float translucencyPower = 4.5;
float translucencyScale = 10.0;
float translucencyDistortion = 0.15;
float translucencyAmbient = 3.2;

float attnConst = 0.56;
float attnLin = 0.03;
float attnExp = 0.002;

vec3 lightColor = vec3(1, 1, 1);

void main()
{
    vec4 result = vec4( 0, 0, 0, 1 );

    
    float shininess = 128.0;

    float colorStep = 1.0 / 255.0;
    //blue
    vec4 diffuseColor = vec4( 9.0*colorStep, 80.0*colorStep, 255.0*colorStep, 1.0 );
    //jade
    //vec4 diffuseColor = vec4( 0.0*colorStep, 68.0*colorStep, 41.0*colorStep, 1.0 );
    //yellow
    //vec4 diffuseColor = vec4( 255.0*colorStep, 77.0*colorStep, 11.0*colorStep, 1.0 );

    float distanceVertToLight = length(lightPosForFrag - vertexForFrag );
    float lightAttenuation = (1.0 / (attnConst + attnLin*distanceVertToLight + attnExp*distanceVertToLight*distanceVertToLight));
    
    vec4 thickness = texture2D(texSampler, texCoordForFrag );

    vec3 translucencyLightDirection = normalize(lightDir + (normalForFrag * translucencyDistortion) );
    float translucencyDot = pow(clamp(dot(viewDir, -translucencyLightDirection), 0.0, 1.0 ), translucencyPower ) * translucencyScale;
    vec3 translucencyResult = lightAttenuation * (translucencyDot + translucencyAmbient) * thickness.rgb;

    float diffuseIntensity = max( dot(normalForFrag, lightDir), 0.0 );
    
    vec3 diffuseResult = diffuseColor.rgb * lightColor * diffuseIntensity;
    vec3 halfVector = normalize(viewDir + lightDir);			
    vec3 specular = vec3(clamp(6.0*pow(max(dot(normalForFrag, halfVector), 0.0), shininess ), 0.0, 1.0 ) ) ;

    result.rgb = (diffuseResult + specular) * lightAttenuation;
    result.rgb += diffuseColor.rgb * lightColor * translucencyResult;
    result.rgb = clamp( result.rgb, 0.0, 1.0 );
    gl_FragColor = result;
}