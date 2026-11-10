/**
 * Shader dell'interno della capsula di rientro: una sola sfera, una sola passata.
 * - interno: panorama equirettangolare scurito, illuminato dal plasma (luce arancione che pulsa vicino agli oblò);
 * - oblò: la maschera (bianco = vetro) lascia vedere un plasma di rientro animato (fbm in flusso veloce, nucleo bianco-giallo,
 *   arancione, rosso scuro ai bordi, lampi, scintille e striature), con un alone additivo attorno al bordo del vetro.
 * La direzione di campionamento (`vDir`) segue la stessa convenzione di `direzione(lon, lat)` in CapsulaRientro.tsx.
 */

export const vertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform sampler2D uMask;
uniform float uTime;      // secondi (gia' scalati se le animazioni sono ridotte)
uniform float uScuro;     // 0..1: quanto resta della luminosita' di base
uniform vec3 uOblo[3];    // direzioni dei centri degli oblo'
uniform vec3 uOffo[3];    // x = cos(raggio angolare), y = raggio in rad, z = 0
varying vec3 vDir;

const float PI = 3.14159265359;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }
  return s;
}

// lampi irregolari, uguali in tutta la capsula
float lampo(float t) {
  float a = smoothstep(0.62, 0.95, noise(vec3(t * 2.3, 1.0, 0.0)));
  float b = smoothstep(0.55, 0.9, noise(vec3(t * 5.9, 7.0, 3.0)));
  return a * 0.9 + b * 0.5;
}
// tremolio della luce: stesso rumore del plasma, a bassa frequenza
float pulsa(float t) {
  return 0.72 + 0.5 * fbm(vec3(t * 1.7, 3.0, 5.0)) + 0.5 * lampo(t);
}

vec3 rampa(float i) {
  vec3 rosso = vec3(0.22, 0.018, 0.0);
  vec3 arancio = vec3(1.0, 0.30, 0.03);
  vec3 giallo = vec3(1.0, 0.78, 0.30);
  vec3 bianco = vec3(1.0, 0.97, 0.88);
  vec3 c = mix(rosso, arancio, smoothstep(0.12, 0.5, i));
  c = mix(c, giallo, smoothstep(0.5, 0.78, i));
  return mix(c, bianco, smoothstep(0.8, 1.05, i));
}

// plasma visto da un oblo' con centro w: coordinate locali, flusso verso l'alto dell'oblo'
vec3 plasma(vec3 d, vec3 w, float t) {
  vec3 su = normalize(vec3(0.0, 1.0, 0.0) - w * w.y + vec3(0.0001));
  vec3 dx = normalize(cross(w, su));
  vec2 p = vec2(dot(d, dx), dot(d, su)) * 5.2;          // circa -1..1 nell'oblo'
  float vel = 6.5;
  vec2 q = vec2(p.x * 2.1, p.y * 0.85 - t * vel);       // allungato lungo il flusso
  // deformazione del dominio: il gas si arriccia
  float w1 = fbm(vec3(q.x * 0.9, q.y * 0.9 - t * 1.5, t * 0.8));
  float w2 = fbm(vec3(q.x * 1.3 + 4.0, q.y * 0.6, t * 1.1 + 9.0));
  vec3 s = vec3(q.x + (w1 - 0.5) * 1.6, q.y + (w2 - 0.5) * 2.0, t * 0.7);
  float n = fbm(s * vec3(1.0, 0.9, 1.0));
  float striature = pow(noise(vec3(p.x * 9.0, p.y * 0.6 - t * 11.0, 3.0)), 3.0);
  float i = n * 1.25 - 0.18 + striature * 0.45 - p.y * 0.12;
  // nucleo piu' caldo al centro, bordi piu' scuri e rossi
  float r = length(p);
  i += (0.55 - r) * 0.55;
  i *= 1.0 + lampo(t) * 0.5;
  vec3 c = rampa(clamp(i, 0.0, 1.2));
  // scintille: tratti sottili e luminosi che scorrono veloci
  vec2 g = vec2(p.x * 26.0, p.y * 2.0 - t * 16.0);
  float sc = noise(vec3(g, 11.0));
  c += vec3(1.0, 0.8, 0.5) * pow(smoothstep(0.82, 1.0, sc), 2.0) * 2.2;
  c *= 0.7 + 0.5 * smoothstep(0.3, 1.0, i);
  return c;
}

void main() {
  vec3 d = normalize(vDir);
  float lon = atan(d.x, -d.z);
  float u = lon / (2.0 * PI) + 0.5;
  float v = asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5;
  // niente cucitura: si sceglie la coordinata u senza salto per le derivate
  float u2 = fract(u + 0.5) - 0.5;
  vec2 uv = vec2(u, v);
  vec2 g = fwidth(u) <= fwidth(u2) ? vec2(u, v) : vec2(u2, v);
  vec2 gx = dFdx(g), gy = dFdy(g);
  vec3 base = textureGrad(uTex, uv, gx, gy).rgb;
  float m = textureGrad(uMask, uv, gx, gy).r;

  float t = uTime;
  float puls = pulsa(t);
  // luce del plasma sulle pareti
  float luce = 0.0, alone = 0.0;
  for (int k = 0; k < 3; k++) {
    float c = dot(d, uOblo[k]);
    float ang = acos(clamp(c, -1.0, 1.0));
    luce += exp(-ang / 0.55) * (k == 2 ? 0.55 : 1.0);
    alone += exp(-max(ang - uOffo[k].y, 0.0) / 0.07) * (ang > uOffo[k].y ? 1.0 : 0.0);
  }
  vec3 tinta = vec3(1.0, 0.42, 0.10);
  vec3 interno = base * uScuro * (0.22 + 1.5 * luce * puls * tinta + 0.12 * puls * tinta);
  interno += tinta * alone * puls * 0.55;          // bagliore sul bordo del vetro

  vec3 col = interno;
  if (m > 0.002) {
    // oblo' piu' vicino
    int best = 0; float bd = -2.0;
    for (int k = 0; k < 3; k++) { float c = dot(d, uOblo[k]); if (c > bd) { bd = c; best = k; } }
    vec3 w = best == 0 ? uOblo[0] : best == 1 ? uOblo[1] : uOblo[2];
    vec3 pl = plasma(d, w, t + float(best) * 3.7);
    // lieve bordo scuro del vetro e riflesso
    pl *= 0.92 + 0.08 * smoothstep(0.0, 1.0, m);
    col = mix(interno, pl, m);
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`
