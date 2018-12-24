precision mediump float;

varying vec3 fragPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;
uniform sampler2D sampler;
uniform vec3 lightPos;
uniform vec3 viewPos;

void main(){
    vec3 lightColor = vec3(0.5, 0.5, 0.5);

    float ambientStrength = 0.10;
    vec3 ambient = ambientStrength * lightColor;

    vec3 lightDirection = normalize(lightPos-fragPos);
    float diff = max(dot(fragNormal, lightDirection), 0.0);
    vec3 diffuse = diff * lightColor;

    float specularStrength = 0.5;
    vec3 viewDir = normalize(viewPos-fragPos);
    vec3 reflectDir = reflect(-lightDirection, fragNormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = specularStrength*spec*lightColor;

    vec3 result = (ambient+diffuse + specular) * texture2D(sampler, fragTexCoord).xyz;
    gl_FragColor = vec4(result, 1.0);
}