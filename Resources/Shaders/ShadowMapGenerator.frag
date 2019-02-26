precision mediump float;

uniform vec3 lightPosition;
uniform vec3 shadowClipNearFar;

varying vec3 vertexForFrag;

void main() {
    vec3 lightToFragment = vertexForFrag - lightPosition;
    float lightDistance = (length(lightToFragment) - shadowClipNearFar.x)/
    (shadowClipNearFar.y - shadowClipNearFar.x);

	gl_FragColor = vec4(lightDistance, lightDistance, lightDistance, 1.0);
}
