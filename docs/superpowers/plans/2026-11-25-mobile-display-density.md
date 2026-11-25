# Mobile display density implementation plan

**Goal:** Match the approved Chrome mobile composition when another browser on the same phone reports a wider CSS viewport.

**Evidence:** The supplied device reports Chrome width 411.4286 / DPR 2.625 and Firefox width 522 / DPR 2.06897. Both load index-Bjzu5I_Y.js and Kahroba. The physical screen width is the same (1080 pixels). Mixed fixed-pixel dimensions and fluid image dimensions explain the mismatch.

**Architecture:** Keep viewport height tracking in the app shell. Apply a mobile-only CSS layout zoom to the content surface above a 412 CSS-pixel composition width. Below that width retain the existing responsive and compact layouts. Desktop presentation remains outside this surface. Do not use user-agent detection or change the viewport meta tag or disable pinch zoom.

**Scope:** useMobileViewport.ts owns the density variable; PhonePreview.module.css consumes it; ScrollArea uses consistent rendered pointer coordinates. Diagnostics exposes the resulting composition width. No service, route, or domain-state changes.

## Verification and execution

- [x] Reproduce the supplied 411/522 width and DPR pairs in Chromium and Firefox; compare normalized card, nav, button, and text geometry on the same route and state.
- [x] Add a failing regression for the cross-density composition and scrollbar dragging.
- [x] Implement mobile surface density and correct scrollbar coordinate conversion.
- [x] Check 320/390/411/430/522 widths, short viewport height, resize, pinch-zoom preservation, lesson playback and fullscreen.
- [x] Run TypeScript build, lint, browser flow suite and cross-engine density suite.
- [x] Publish source and Pages to the existing repository; inspect the deployed bundle and route.

The physical browser toolbars may consume different heights; the app must fill each available viewport without outer scrolling. Device screenshots remain the final confirmation of physical-phone rendering.

## Review findings addressed

- Onboarding and coach chat consumed the outer viewport height inside the scaled surface. Added local height and native-inset variables and tests for normalized intro position and keyboard-height chat reachability.
- Billing/action minimum heights used native viewport units. Added a failing 522x350 regression, converted the caps to local surface height, and verified internal scrolling reaches the final action.
- Firefox fullscreen changes the emulated viewport to its desktop screen width, hiding the old stage. The desktop restriction now excludes active fullscreen. Tests cross the breakpoint explicitly in Chromium and through native fullscreen resizing in Firefox.
- Independent source review after these changes found no remaining important blockers. Device-only keyboard, pinch and native inset behavior remains a physical-device verification boundary; automated height/scale/inset cases cover the code paths.

## Release verification

- Source implementation: afad105. Pages: 68b4ac39014ea11196cb85fe9e1ae02c54b3a5ba.
- Pages workflow 45705795661 completed successfully; public HTML serves index-Dte1cJ2X.js.
- Public `/courses` checked in Chromium at 411x750/DPR2.625 and Firefox at 522x942/DPR2.06897. Composition widths were 411 and 412 respectively, viewport heights remained 750 and 942 with no outer scroll. Rendered nav-height/width ratios were 0.16302 and 0.16261.
- `npm.cmd run lint`, `npm.cmd run test:display`, and `npm.cmd run test:browser` passed. Playback, fullscreen, short billing/action sheets, onboarding, coach chat and native-inset calculations have regression coverage.
