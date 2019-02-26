precision mediump float;

attribute vec3 vertPosition;

varying vec3 vertexForFrag;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
//ofcourse webgl cant do basic shit like transposing or inverting, so the cpu has to
//this can be used to get the normal to world space
uniform mat4 mvp;


void main(){
   vertexForFrag = (mWorld * vec4(vertPosition, 1.0)).xyz;
   //auslagern auf cpu! multiplikationen sparen!
   gl_Position= mvp * vec4(vertPosition, 1.0);
}