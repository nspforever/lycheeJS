
attribute vec2 aPosition;
attribute vec2 aTexture;

uniform vec2 uTexture;  // texture width/height
uniform vec2 uViewport; // viewport width/height

varying vec2 vTexture;

void main(void) {

	vTexture.x = aTexture.x / uTexture.x;
	vTexture.y = aTexture.y / uTexture.y;

	gl_Position.zw = vec2(1.0, 1.0);
	gl_Position.x  =         (aPosition.x / uViewport.x) * 2.0 - 1.0;
	gl_Position.y  = -1.0 * ((aPosition.y / uViewport.y) * 2.0 - 1.0);

}
