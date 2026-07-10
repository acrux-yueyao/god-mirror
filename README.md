# EIDOLON — From Oracle to Mirror · 神谕之镜

一位由语言、光与投影构成的神明。他不属于任何一个宗教，却借走了所有宗教的手势。

An interactive web piece: a hand-painted deity assembled from layered artwork lives on screen —
breathing, blinking, following your cursor. Type a prayer and the rosary lights up as he answers
in vertical script. Then press **BEGIN THE UNVEILING**: the swirling light disperses first, the
robe follows, the face goes last — until only the red halo and the ink cloud remain, framing
your own webcam face where the god used to be. *From oracle to mirror.*

## Run

Camera access requires a secure context, so serve it locally instead of opening the file directly:

```sh
python3 -m http.server 8642
# then open http://localhost:8642
```

## Interactions

| Action | Effect |
| --- | --- |
| Move the mouse | The god's head and body subtly turn toward you |
| Type anywhere + `Enter` | Your prayer rises, the rosary beads light up, an oracle replies (`Esc` clears) |
| `ENABLE CAMERA` | Starts the webcam feed (hidden until the unveiling) |
| `BEGIN THE UNVEILING` | 9s staged fade: swirls → robe → face; halo + third eye stay to frame *you* |
| `RESTORE THE GOD` | Reverses the unveiling |
| `ADJUST 调整模式` | Drag layers, scroll to scale, sliders for sizes — positions persist in `localStorage` |

## Structure

- `index.html` — the whole piece (no dependencies, vanilla JS)
- `layers/` — hand-painted parts: face (open/closed eyes), body, hands, halo ring, ink-cloud third eye, light swirls, rosary

Built from the "Oracle to Mirror" design handoff (turn 4a *The Living Eidolon*, HUD direction 5a 金泥仪典).
