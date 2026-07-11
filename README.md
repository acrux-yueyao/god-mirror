# EIDOLON — From Oracle to Mirror · 神谕之镜

一位由语言、光与投影构成的神明。他不属于任何一个宗教，却借走了所有宗教的手势。

We no longer pray — we open a chat. This interactive piece stages that substitution:
what looks like an AI companion app summons a beautiful hand-painted deity, and the
longer you confide in him, the thinner he becomes — his replies echoing your own words
back — until, in the final performance, he closes his eyes and hands the act of seeing
over to you: only the red halo and the ink-cloud third eye remain, framing your own
webcam face where the god used to be. *From oracle to mirror.*

**Live**: https://acrux-yueyao.github.io/god-mirror/

## The arc

| Act | What happens |
| --- | --- |
| 连接 | Black screen, a single input line. Your first message is the summon |
| 显形 | Gacha-cadence entrance: red comet with a star trail → gold flash → layers slam in → he blinks, name card holds, his first reply types out |
| 倾诉 · 回响 · 动摇 | A real conversation. DIVINITY falls each turn; his replies begin quoting your words; his face flickers; the typing indicator stutters |
| 揭幕 | Around the tenth message he says it himself: 「让你看看，一直在回答你的，是谁。」 All motion freezes. Stars stream off the swirls. The robe dissolves upward like paper ash. He closes his eyes. DIVINITY rolls to 0 |
| 镜 | Your camera face appears inside the halo. His last line is stitched from your own words. You can keep the conversation as a downloadable talisman |

`BEGIN THE UNVEILING` skips ahead; `RESTORE THE GOD` brings him back. `SKIP ▸▸` fast-forwards any performance.

## Run locally

```sh
python3 -m http.server 8642
# open http://localhost:8642  (camera needs a secure context — localhost or the Pages URL)
```

## Structure

- `index.html` + `css/style.css` + `js/` — vanilla ES modules, no build step
  - `app.js` — act state machine, layer engine, summon and unveiling performances
  - `oracle.js` — his voice: LLM proxy client with an act-grouped offline fallback pool
  - `audio.js` — fully synthesized soundscape (drone, blip, bell, riser, heartbeat)
  - `keepsake.js` — renders the conversation as a 3:4 talisman PNG
- `layers/` — hand-painted parts: face (open/closed eyes), body, hands, halo ring, ink-cloud third eye, light swirls
- `worker/` — optional Cloudflare Worker proxy for real Claude replies (see `worker/README.md`); without it the piece runs fully offline

Built from the "Oracle to Mirror" design handoff (turn 4a *The Living Eidolon*, HUD 5a 金泥仪典).
