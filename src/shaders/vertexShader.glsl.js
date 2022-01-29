const vertexShader = `
varying vec2 vUv;

uniform sampler2D heightMap;

uniform sampler2D normalMap;
uniform float R;
uniform float heightScale;


void main() {

    vUv = uv;

    vec4 heightMapValue = texture2D(heightMap, vUv);

    float heightValue = 1.0 + heightScale * heightMapValue.x;

    vec3 newPos = heightValue*position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

    vec3 rgb_normal = texture(normalMap, vUv).xyz * 0.5 + 0.5;


}
`

export default vertexShader;