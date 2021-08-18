export const PILEUP_COLORS = {
    BG: [0.89, 0.89, 0.89, 1], // gray for the read background
    BG2: [0.85, 0.85, 0.85, 1], // used as alternating color in the read counter band
    BG_MUTED: [0.92, 0.92, 0.92, 1], // covergae background, when it is not exact
    A: [0, 0, 1, 1], // blue for A
    C: [1, 0, 0, 1], // red for c
    G: [0, 1, 0, 1], // green for g
    T: [1, 1, 0, 1], // yellow for T
    S: [0, 0, 0, 0.5], // darker grey for soft clipping
    H: [0, 0, 0, 0.5], // darker grey for hard clipping
    X: [0, 0, 0, 0.7], // black for unknown
    I: [1, 0, 1, 0.5], // purple for insertions
    D: [1, 0.5, 0.5, 0.5], // pink-ish for deletions
    N: [1, 1, 1, 1],
    BLACK: [0, 0, 0, 1],
    BLACK_05: [0, 0, 0, 0.5],
    PLUS_STRAND: [0.75, 0.75, 1, 1],
    MINUS_STRAND: [1, 0.75, 0.75, 1]
};

const createColorTexture = (PIXI: any, colors: any) => {
    const colorTexRes = Math.max(2, Math.ceil(Math.sqrt(colors.length)));
    const rgba = new Float32Array(colorTexRes ** 2 * 4);
    colors.forEach((color: any, i: any) => {
        rgba[i * 4] = color[0]; // r
        rgba[i * 4 + 1] = color[1]; // g
        rgba[i * 4 + 2] = color[2]; // b
        rgba[i * 4 + 3] = color[3]; // a
    });

    return [PIXI.Texture.fromBuffer(rgba, colorTexRes, colorTexRes), colorTexRes];
};

export function setUpShaderAndTextures(HGC: any, colorRGBAs: [number, number, number, number][]) {
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
