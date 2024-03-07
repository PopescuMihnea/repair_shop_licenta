import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    origin: "http://localhost:5173",
    host: false,
    https: {
      key: fs.readFileSync("../../HTTPSCert/cars.com+6-key.pem"),
      cert: fs.readFileSync("../../HTTPSCert/cars.com+6.pem"),
    },
  },
  plugins: [react()],
});
