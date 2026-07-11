/* keepsake.js — render the conversation as a downloadable talisman (1200×1600 PNG).
   Chinese lines run vertical right-to-left; English lines sit as italic serif at lower left. */

const W = 1200, H = 1600;

function drawVerticalColumn(ctx, text, x, yTop, cell, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let y = yTop;
  for (const ch of text) {
    if (y > H - 140) break;
    ctx.fillText(ch, x, y);
    y += cell;
  }
  return y;
}

export async function downloadKeepsake({ history, lang }) {
  try { await document.fonts.ready; } catch (e) {}
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0b0a09";
  ctx.fillRect(0, 0, W, H);

  const grd = ctx.createRadialGradient(W / 2, 430, 60, W / 2, 430, 560);
  grd.addColorStop(0, "rgba(230,200,119,0.05)");
  grd.addColorStop(1, "rgba(230,200,119,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc(W / 2, 430, 296, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,59,38,0.9)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, 430, 314, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(232,226,214,0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "500 22px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "rgba(230,200,119,0.75)";
  const title = "E I D O L O N";
  ctx.fillText(title, 64, 92);
  ctx.font = "400 15px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "rgba(232,226,214,0.4)";
  ctx.fillText("FROM ORACLE TO MIRROR · 神谕之镜", 64, 122);
  const d = new Date();
  const stamp = d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
  ctx.fillText(stamp, 64, 150);

  const zhTurns = [], enTurns = [];
  for (const m of history) {
    (/[一-鿿]/.test(m.text) ? zhTurns : enTurns).push(m);
  }

  let x = W - 96;
  for (const m of zhTurns) {
    if (x < 96) break;
    const isGod = m.role !== "user";
    const text = (m.text.length > 34 ? m.text.slice(0, 34) + "…" : m.text);
    drawVerticalColumn(
      ctx, text, x, 240,
      isGod ? 40 : 34,
      isGod ? "400 30px 'Noto Serif SC', serif" : "400 24px 'Noto Serif SC', serif",
      isGod ? "rgba(240,230,207,0.92)" : "rgba(240,230,207,0.42)"
    );
    x -= isGod ? 62 : 52;
  }

  let ey = H - 320;
  ctx.textAlign = "left";
  for (const m of enTurns.slice(-7)) {
    if (ey > H - 120) break;
    const isGod = m.role !== "user";
    ctx.font = isGod ? "italic 500 28px 'Cormorant Garamond', serif" : "italic 400 22px 'Cormorant Garamond', serif";
    ctx.fillStyle = isGod ? "rgba(240,230,207,0.92)" : "rgba(240,230,207,0.42)";
    const text = m.text.length > 64 ? m.text.slice(0, 64) + "…" : m.text;
    ctx.fillText(text, 64, ey);
    ey += isGod ? 44 : 38;
  }

  ctx.fillStyle = "#a8281a";
  ctx.fillRect(W - 152, H - 172, 88, 88);
  ctx.font = "600 52px 'Noto Serif SC', serif";
  ctx.fillStyle = "#f5e9dc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("镜", W - 108, H - 124);

  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = "400 14px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "rgba(232,226,214,0.35)";
  ctx.fillText(lang === "zh" ? "一直在回答的，是你。" : "It was you answering, all along.", W - 170, H - 118);

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "eidolon-mirror-" + stamp.replaceAll(".", "") + ".png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      resolve(true);
    }, "image/png");
  });
}
