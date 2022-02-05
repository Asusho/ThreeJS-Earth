const atmosphereFragmentShader = `

varying vec3 vertexNormal;

uniform vec3 cameraDirection;
uniform float cameraDistance;

void main() {
    
    vec3 VN = normalize(vertexNormal);

    float intensity = pow(1.1 - cameraDistance*dot(cameraDirection,VN),2.0);

    gl_FragColor = vec4(0.3,0.6,1.0,0.8) * intensity;


}
`
export default atmosphereFragmentShader;