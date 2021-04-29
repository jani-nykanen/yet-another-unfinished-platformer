export const VertexSource = {
    Default: `attribute vec2 vertexPos;
attribute vec2 vertexUV;

uniform mat3 transform;
uniform vec2 pos;
uniform vec2 size;

varying vec2 uv;

void main() {

    gl_Position = vec4(transform * vec3(vertexPos * size + pos, 1), 1);
    uv = vertexUV;
}`,
};
export const FragmentSource = {
    Default: `precision mediump float;
     
uniform sampler2D texSampler;

uniform vec4 color;

uniform vec2 texPos;
uniform vec2 texSize;

varying vec2 uv;

void main() {

    vec2 tex = uv * texSize + texPos;    
    vec4 res = texture2D(texSampler, tex) * color;
    gl_FragColor = res;
}`,
};
