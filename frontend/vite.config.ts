import { defineConfig } from "vite";

export default defineConfig({
  // Hálózati / leképezett meghajtón (pl. T:) a valódi útvonal feloldása hibát okozna
  resolve: { preserveSymlinks: true },
  server: {
    port: 5173,
    // A /api kéréseket továbbítja a Node backendnek
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
});
