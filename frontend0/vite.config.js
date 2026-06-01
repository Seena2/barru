import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      //any request that starts with '/api' should be forwarded to the port '8080'
      // where the server is runing
      "/api": "http://localhost:8080",
    },
  },
});
