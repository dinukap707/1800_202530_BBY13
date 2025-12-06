// This Vite config file (vite.config.js) tells Rollup (production bundler)
// to treat multiple HTML files as entry points so each becomes its own built page.

// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // main entry / landing page
        index: resolve(__dirname, "index.html"),

        // core app pages
        main: resolve(__dirname, "main.html"),
        map: resolve(__dirname, "map.html"),
        upload: resolve(__dirname, "upload.html"),
        profile: resolve(__dirname, "profile.html"),
        profileView: resolve(__dirname, "profileView.html"),
        details: resolve(__dirname, "details.html"),

        // quest stuff
        activeQuests: resolve(__dirname, "activeQuests.html"),
        completedQuests: resolve(__dirname, "completedQuests.html"),

        // auth + settings / options
        signup: resolve(__dirname, "signup.html"),
        settings: resolve(__dirname, "settings.html"),
        accountOptions: resolve(__dirname, "account_options.html"),
        dataOptions: resolve(__dirname, "data_options.html"),
        socialOptions: resolve(__dirname, "social_options.html"),
      },
    },
  },
});
