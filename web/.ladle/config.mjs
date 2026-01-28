export default {
  stories: "src/**/*.stories.{tsx,jsx}",
  viteConfig: "./.ladle/vite.config.mjs",
  hotkeys: {
    fullscreen: ["f"],
    width: ["w"],
  },
  addons: {
    width: {
      enabled: true,
      options: {
        xsmall: 414,
        small: 640,
        medium: 768,
        large: 1024,
        xlarge: 1280,
      },
      defaultState: 0, // 0 forces a default render without preset width
    },
  },
};
