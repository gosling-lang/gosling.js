type ColorRGBA = [r: number, g: number, b: number, a: number];

const createColorTexture = (PIXI: typeof import('pixi.js'), colors: ColorRGBA[]) => {
    const colorTexRes = Math.max(2, Math.ceil(Math.sqrt(colors.length)));
    const rgba = new Float32Array(colorTexRes ** 2 * 4);
    colors.forEach((color, i) => {
        rgba[i * 4] = color[0]; // r
        rgba[i * 4 + 1] = color[1]; // g
        rgba[i * 4 + 2] = color[2]; // b
        rgba[i * 4 + 3] = color[3]; // a
    });

    return [PIXI.Texture.fromBuffer(rgba, colorTexRes, colorTexRes), colorTexRes] as const;
};

export function setUpShaderAndTextures(HGC: typeof import('@higlass/available-for-plugins'), colorRGBAs: ColorRGBA[]) {
    // console.log(colorRGBAs);

    const [colorMapTex, colorMapTexRes] = createColorTexture(HGC.libraries.PIXI, colorRGBAs);

    const uniforms = new HGC.libraries.PIXI.UniformGroup({
        uColorMapTex: colorMapTex,
        uColorMapTexRes: colorMapTexRes
    });

    return HGC.libraries.PIXI.Shader.from(
        `
  attribute vec2 position;
  attribute float aColorIdx;
  uniform mat3 projectionMatrix;
  uniform mat3 translationMatrix;
  uniform sampler2D uColorMapTex;
  uniform float uColorMapTexRes;
  varying vec4 vColor;
  void main(void)
  {
      // Half a texel (i.e., pixel in texture coordinates)
      float eps = 0.5 / uColorMapTexRes;
      float colorRowIndex = floor((aColorIdx + eps) / uColorMapTexRes);
      vec2 colorTexIndex = vec2(
        (aColorIdx / uColorMapTexRes) - colorRowIndex + eps,
        (colorRowIndex / uColorMapTexRes) + eps
      );
      vColor = texture2D(uColorMapTex, colorTexIndex);
      gl_Position = vec4((projectionMatrix * translationMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
  }
`,
        `
varying vec4 vColor;
  void main(void) {
      gl_FragColor = vColor;
  }
`,
        uniforms
    );
}
