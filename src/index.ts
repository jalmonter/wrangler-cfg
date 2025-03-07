#!/usr/bin/env node
import { writeFileSync } from "fs";
import { join } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { experimental_readRawConfig, Unstable_RawConfig } from "wrangler";

import { description } from "../package.json";

type JSONConfig = Unstable_RawConfig & { $schema: string };

yargs(hideBin(process.argv))
  .command(
    "migrate",
    description,
    (yargs) => {
      return yargs.option("to", {
        describe: "Target file format",
        choices: ["json", "jsonc"],
        demandOption: true,
      }).option('save', {
        describe: 'Save the generated JSONC file',
        type: 'boolean',
        default: false,
      });
    },
    (argv) => {
      try {
        const configPath = join(process.cwd(), "wrangler.toml");

        if (!argv.to.includes("json")) {
          throw new Error("The only supported target format is JSONC");
        }

        const { rawConfig } = experimental_readRawConfig({
          config: configPath,
        });

        const jsonConfig: JSONConfig = {
          $schema: "node_modules/wrangler/config-schema.json",
          ...rawConfig,
        };

        if (argv.save) {
          const outputPath = join(process.cwd(), `wrangler.${argv.to}`);
          writeFileSync(outputPath, JSON.stringify(jsonConfig, null, 2));
          console.log(`Configuration successfully migrated to ${outputPath}`);
        } else {
          console.log(JSON.stringify(jsonConfig, null, 2));
        }
      } catch (error: any) {
        console.error(error.message);
        process.exit(1);
      }
    }
  )
  .demandCommand(1, "You need at least one command before moving on")
  .help().argv;
