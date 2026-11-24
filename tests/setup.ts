// The app picks its language from ?lang, the saved choice, then the browser language.
// jsdom reports English, so default the test browser to Chinese; English tests switch explicitly.
Object.defineProperty(window.navigator, "language", { value: "zh-CN", configurable: true });
