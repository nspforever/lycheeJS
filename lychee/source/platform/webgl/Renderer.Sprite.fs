#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexture;
uniform sampler2D uSampler;

void main(void) {

	vec4 vColor = texture2D(uSampler, vTexture);
	gl_FragColor = vColor;

}
