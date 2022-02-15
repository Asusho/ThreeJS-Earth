const vertexShader = `
varying vec2 vUv;


uniform sampler2D heightMap;

uniform float R;
uniform float heightScale;


void main() {

    vUv = uv;

    vec4 heightMapValue = texture2D(heightMap, vUv);

    float heightValue = 1.0 + heightScale * heightMapValue.x;

    vec3 newPos = heightValue*position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

}
`

export default vertexShader;