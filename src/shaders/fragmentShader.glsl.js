const fragmentShader = `
uniform sampler2D texture1;
uniform sampler2D borderMap;
uniform vec4 borderColor;
varying vec2 vUv;
uniform vec2 resolution;

void main() {

    vec4 border = texture2D(borderMap,vUv);

    if(border.x > 0.5){
        vec4 texture = texture2D(texture1, vUv);
        vec4 resultColor = mix(texture, borderColor, 0.5);
        gl_FragColor = resultColor;
    }
    else{
        gl_FragColor = texture2D(texture1, vUv);
    }

}
`
export default fragmentShader;