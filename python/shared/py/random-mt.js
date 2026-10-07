/**
 * Mersenne Twister exactly as CPython's random module uses it, so random.seed(42) gives the same
 * numbers here and in a real interpreter.
 */
export class MersenneTwister {
  constructor() { this.mt = new Uint32Array(624); this.index = 625; }

  initGenrand(s) {
    const mt = this.mt;
    mt[0] = s >>> 0;
    for (let i = 1; i < 624; i++) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = (((((prev & 0xffff0000) >>> 16) * 1812433253) << 16) + (prev & 0x0000ffff) * 1812433253 + i) >>> 0;
    }
    this.index = 624;
  }

  initByArray(key) {
    const mt = this.mt;
    this.initGenrand(19650218);
    let i = 1, j = 0;
    const n = 624;
    for (let k = Math.max(n, key.length); k > 0; k--) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ (((((prev & 0xffff0000) >>> 16) * 1664525) << 16) + (prev & 0x0000ffff) * 1664525)) + key[j] + j) >>> 0;
      i++; j++;
      if (i >= n) { mt[0] = mt[n - 1]; i = 1; }
      if (j >= key.length) j = 0;
    }
    for (let k = n - 1; k > 0; k--) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ (((((prev & 0xffff0000) >>> 16) * 1566083941) << 16) + (prev & 0x0000ffff) * 1566083941)) - i) >>> 0;
      i++;
      if (i >= n) { mt[0] = mt[n - 1]; i = 1; }
    }
    mt[0] = 0x80000000;
    this.index = 624;
  }

  /** random.seed(n): the integer is split into 32-bit words, little end first. */
  seed(value) {
    let v = BigInt(value);
    if (v < 0n) v = -v;
    const key = [];
    while (v > 0n) { key.push(Number(v & 0xffffffffn)); v >>= 32n; }
    if (!key.length) key.push(0);
    this.initByArray(key);
  }

  genrand() {
    const mt = this.mt;
    if (this.index >= 624) {
      if (this.index === 625) this.initGenrand(5489);
      for (let kk = 0; kk < 624; kk++) {
        const y = (mt[kk] & 0x80000000) | (mt[(kk + 1) % 624] & 0x7fffffff);
        mt[kk] = (mt[(kk + 397) % 624] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0)) >>> 0;
      }
      this.index = 0;
    }
    let y = mt[this.index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  /** random.random(): 53 bits from two draws. */
  random() {
    const a = this.genrand() >>> 5, b = this.genrand() >>> 6;
    return (a * 67108864 + b) / 9007199254740992;
  }

  getrandbits(k) {
    if (k <= 32) return BigInt(this.genrand() >>> (32 - k));
    let out = 0n, shift = 0n, left = k;
    while (left > 0) {
      const r = this.genrand();
      const take = Math.min(32, left);
      out |= BigInt(take < 32 ? r >>> (32 - take) : r) << shift;
      shift += 32n;
      left -= take;
    }
    return out;
  }

  /** random._randbelow(n): rejection sampling on getrandbits(k). */
  randbelow(n) {
    if (n <= 0n) return 0n;
    const k = n.toString(2).length;
    let r = this.getrandbits(k);
    while (r >= n) r = this.getrandbits(k);
    return r;
  }
}
