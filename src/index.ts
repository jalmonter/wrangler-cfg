#!/usr/bin/env node

import { writeFileSync } from "fs";
import { join } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { experimental_readRawConfig, Unstable_RawConfig } from "wrangler";
import { name, description, homepage } from "../package.json";

const generateBanner = (name: string, homepage: string): string =>
  `
/**
 * ==================================================================
 * 🚀 This file was generated using \`${name} migrate\` command. 🚀
 * 
 * 📌 Learn more, contribute, or report issues:
 *    👉 [${homepage}]
 *     
 * You can safely remove this banner if you want.
 * ==================================================================
 */`.trim();

type JSONConfig = Unstable_RawConfig & { $schema: string };

const migrateCommand = {
  command: "migrate",
  describe: description,
  builder: (yargs: yargs.Argv) => {
    return yargs
      .option("to", {
        alias: "t",
        describe: "Target file format",
        choices: ["json", "jsonc"],
        demandOption: true,
      })
      .option("save", {
        alias: "s",
        describe: "Save the generated JSON[C] file",
        type: "boolean",
        default: false,
      })
      .option("file", {
        alias: "f",
        describe: "Target wrangler file",
        default: "wrangler.toml",
      });
  },
  handler: (
    argv: yargs.Arguments<{ to: string; save: boolean; file: string }>
  ) => {
    try {
      const configPath = join(process.cwd(), argv.file);

      if (!argv.to.includes("json")) {
        throw new Error("The only supported target format is JSON[C]");
      }

      const { rawConfig } = experimental_readRawConfig({ config: configPath });

      const jsonConfig: JSONConfig = {
        $schema: "node_modules/wrangler/config-schema.json",
        ...rawConfig,
      };

      const fileContent =
        generateBanner(name, homepage) +
        "\n" +
        JSON.stringify(jsonConfig, null, 2);

      if (argv.save) {
        const outputPath = join(process.cwd(), `wrangler.${argv.to}`);
        writeFileSync(
          outputPath,
          argv.to === "jsonc"
            ? fileContent
            : JSON.stringify(jsonConfig, null, 2)
        );
        console.log(`Configuration successfully migrated to ${outputPath}`);
      } else {
        console.log(
          argv.to === "jsonc"
            ? fileContent
            : JSON.stringify(jsonConfig, null, 2)
        );
      }
    } catch (error: any) {
      console.error(error.message);
      process.exit(1);
    }
  },
};

yargs(hideBin(process.argv))
  .command(migrateCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .help().argv;
