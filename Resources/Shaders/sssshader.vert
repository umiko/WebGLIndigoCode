precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertexNormal;
attribute vec2 vertTexCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
//ofcourse webgl cant do basic shit like transposing or inverting, so the cpu has to
//this can be used to get the normal to world space
uniform mat4 mNormal;
uniform mat4 mvp;

uniform vec3 viewPos;
uniform vec3 lightPos;

varying vec3 viewDir;
varying vec3 lightDir;
varying vec3 normalForFrag;
varying vec3 vertexForFrag;
varying vec2 texCoordForFrag;
varying vec3 lightPosForFrag;

void main() 
{   
    texCoordForFrag = vertTexCoord;
    normalForFrag = (mNormal * vec4(normalize(vertexNormal), 1.0)).xyz;
    vertexForFrag = vec3(mWorld*vec4(vertPosition, 1.0));
    lightPosForFrag = lightPos;
    viewDir = normalize( viewPos.xyz - vertexForFrag.xyz );
    lightDir = normalize( lightPos.xyz - vertexForFrag.xyz );

    gl_Position= mvp * vec4(vertPosition, 1.0);	
}