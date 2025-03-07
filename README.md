<h1 align="center"> ⛅️⚙️ wrangler-cfg </h1>
<section align="center" id="shieldio-badges">
<a href="https://www.npmjs.com/package/wrangler-cfg"><img alt="npm"  src="https://img.shields.io/npm/dw/wrangler-cfg?style=flat-square"></a>
</section>

`wrangler-cfg` is a CLI tool that migrates Cloudflare Workers [configuration files](https://developers.cloudflare.com/workers/wrangler/configuration/) from TOML to JSONC.

# Quick Start Guide

Follow these steps to migrate your configuration to JSONC:

1. **Navigate to Your Project's Root Directory**  
  Make sure you are in the directory that contains your `wrangler.toml` file.

2. **Migrate the Configuration**  
  Run the following command to output the migrated JSONC configuration:

  ```bash
  npx wrangler-cfg migrate --to=jsonc
  ```

3. **Save the Migrated Configuration (Optional)**
  If you want to automatically create a `wrangler.jsonc` file in your project, run:

  ```bash
  npx wrangler-cfg migrate --to=jsonc --save
  ```
