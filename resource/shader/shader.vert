precision mediump float;
    
attribute vec3 vertPosition;
attribute vec3 vertexNormal;
attribute vec2 vertTexCoord;
varying vec3 fragNormal;
varying vec3 fragPos;
varying vec2 fragTexCoord;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
//ofcourse webgl cant do basic shit like transposing or inverting, so the cpu has to
uniform mat4 mNormal;

void main(){
   fragTexCoord = vertTexCoord;
   fragNormal = (mNormal * vec4(normalize(vertexNormal), 1.0)).xyz;
   fragPos = vec3(mWorld*vec4(vertPosition, 1.0));
   gl_Position= mProj * mView * mWorld * vec4(vertPosition, 1.0);
}