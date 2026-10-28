# Application screenshot provenance

Captured on **2026-10-28** from the actual local production preview, using
Playwright and Chromium **156.0.8078.4** on Ubuntu ARM64. WebGL2 backend:
ANGLE / Vulkan / SwiftShader (software rendering). No page errors were reported.

The browser viewport was **1440 × 1000 CSS pixels**, device scale factor **1**.
Full-page captures include document overflow; element captures use the canvas
or parameter sidebar bounds. Browser libraries and a test font were supplied
through the project's existing private test environment. The application source,
DOM, styles, and screenshot pixels were not edited for the captures.

All scenes are this project's **synthetic geometry**. No original research image,
texture, or dataset is included in these screenshots. The interface remains German.

| File | Capture | State |
| --- | --- | --- |
| `overview.png` | Full page | Initial Understand preset, Front view, two lines |
| `two-lines.png` | Canvas | Same initial state, Δz = 0.060 |
| `parameters.png` | Parameter sidebar | Same initial state |
| `halo-near.png` | Canvas | Initial state with only Δz changed to 0.001 |
| `halo-saturated.png` | Canvas | Initial state with only Δz changed to 0.200 |
| `line-bundle.png` | Full page | Compare preset, wave bundle, Front view |

All captures use DDH mode, full black width **L = 4 framebuffer pixels**, full strip
width **S = 28 framebuffer pixels**, maximum window-depth displacement
**dmax = 0.12**, cueing off, depth diagnostic off, and zoom 1.

To reproduce, run `npm run build` and `npm run preview -- --port 4189 --strictPort`,
open the app with the viewport above, then select each state using its normal
controls. Capture the full page, `#scene`, or `aside` as indicated. No optional
research-data preparation is needed for these scenes. These images document
appearance; numerical renderer validation is recorded in
[VALIDATION.md](../VALIDATION.md).
