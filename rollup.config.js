import deckyPlugin from "@decky/rollup";
import postcss from "rollup-plugin-postcss";

const config = deckyPlugin();

config.plugins = [
  postcss({
    inject: true,
    minimize: true,
  }),
  ...config.plugins,
];

config.treeshake = {
  ...config.treeshake,
  moduleSideEffects: (id) => id.endsWith(".css"),
};

export default config;
