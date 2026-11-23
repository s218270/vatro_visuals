const fs = require("fs");
const fetch = require("node-fetch");

function bufferToView(buf) {
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
}

async function analyzeUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return { url, error: "HTTP " + res.status };
    const arrBuf = await res.arrayBuffer();
    const arr = new Uint8Array(arrBuf);
    const dv = bufferToView(arr);

    // JPEG detection
    if (dv.getUint8(0) === 0xff && dv.getUint8(1) === 0xd8) {
      for (let i = 2; i < arr.length - 1; i++) {
        if (arr[i] === 0xff) {
          const marker = arr[i + 1];
          if (marker === 0xc2)
            return { url, format: "jpeg", progressive: true };
          if (marker === 0xc0)
            return { url, format: "jpeg", progressive: false };
        }
      }
      return { url, format: "jpeg", progressive: "unknown" };
    }

    // PNG detection (IHDR + interlace byte at offset 28)
    const pngSig = [137, 80, 78, 71, 13, 10, 26, 10];
    let isPng = true;
    for (let i = 0; i < 8; i++)
      if (arr[i] !== pngSig[i]) {
        isPng = false;
        break;
      }
    if (isPng) {
      const interlaceByte = arr[28];
      return { url, format: "png", interlaced: interlaceByte === 1 };
    }

    return { url, format: "unknown" };
  } catch (err) {
    return { url, error: err.message };
  }
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node scripts/check-progressive.js <image-url>");
    process.exit(1);
  }
  const result = await analyzeUrl(url);
  console.log(JSON.stringify(result, null, 2));
}

main();
