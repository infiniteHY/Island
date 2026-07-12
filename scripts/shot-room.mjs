// 房间场景截图：滚动到 #room 后按 SHOTS 指令截图（历史脚本重建版）
// 用法: SHOTS='[{"out":"/tmp/room.png"}]' PORT=5173 node scripts/shot-room.mjs
import puppeteer from "puppeteer-core";

const PORT = process.env.PORT || "5173";
const DPR = Number(process.env.DPR || 1);
const shots = JSON.parse(process.env.SHOTS || '[{"out":"/tmp/room-overview.png"}]');

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--use-angle=metal"]
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: DPR });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => document.querySelector("#room")?.scrollIntoView({ behavior: "instant", block: "center" }));
await new Promise((r) => setTimeout(r, 2500));

for (const s of shots) {
  if (s.wait) await new Promise((r) => setTimeout(r, s.wait));
  if (s.move) await page.mouse.move(s.move[0], s.move[1]);
  if (s.click) {
    await page.mouse.click(s.click[0], s.click[1]);
    await new Promise((r) => setTimeout(r, s.settle ?? 2200));
  }
  if (s.out) {
    await page.screenshot({ path: s.out, clip: s.clip });
    console.log("saved", s.out);
  }
  if (s.esc) {
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 1200));
  }
}
await browser.close();
