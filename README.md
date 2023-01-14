# 🍓 camp `(Berry Camp)`

A static website for browsing rooms from the video game Celeste.

Also allows opening rooms directly in-game with [Everest](https://everestapi.github.io/), which includes a [debugging API](http://localhost:32270) which enables Teleporting when the game is running.

Berry Camp also includes a mobile friendly [HTML Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) map render for each level which can be exported as a `.png` file. This is limited to the [Maximum canvas size](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size) supported by the Web Browser.

Supports most modern browsers and devices, but may not work on older iPhones. Certain features may also not be supported such as the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API).

Written in Typescript using [Next.js](https://nextjs.org/).