
attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform vec2 uViewport;
varying vec2 vTexCoord;

void main(void) {
	vTexCoord = aPosition.zw;
	gl_Position.zw = vec2(1.0, 1.0);
	gl_Position.x  =       aPosition.x / (uViewport.x / 2) - 1;
	gl_Position.y  = -1 * (aPosition.y / (uViewport.y / 2) - 1);

#	old implementation did that on CPU
#	gl_Position.xy = aPosition.xy;

}
