attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
uniform sampler2D uSamplerMap;

varying vec4 coords;

void main() {
    vec3 offset = vec3(0.0, 0.0, 0.0);
    float mod = 0.25; // modifier to adjust the height

    vTextureCoord = aTextureCoord;

    offset = aVertexNormal * texture2D(uSamplerMap, vTextureCoord).b * mod;

    vec4 vertex = vec4(aVertexPosition + offset, 1.0);

    gl_Position = uPMatrix * uMVMatrix * vertex;

    coords = vertex / -mod;
}