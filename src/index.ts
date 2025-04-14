#!/usr/bin/env node

import { writeFileSync } from "fs";
import { join, parse } from "path";
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

const formatOutput = (
  to: string,
  jsonConfig: JSONConfig,
  fileContent: string
): string => {
  return to === "jsonc" ? fileContent : JSON.stringify(jsonConfig, null, 2);
};

const migrateCommand = {
  command: "migrate",
  describe: description,
  builder: (yargs: yargs.Argv) => {
    return yargs
      .option("file", {
        alias: "f",
        describe:
          "Target wrangler file name",
        type: "string",
        default: "wrangler",
      })
      .option("to", {
        alias: "t",
        describe: "Target file format",
        choices: ["json", "jsonc"],
        default: "jsonc",
      })
      .option("save", {
        alias: "s",
        describe: "Save the generated JSON[C] file",
        type: "boolean",
        default: false,
      });
  },
  handler: (
    argv: yargs.Arguments<{ to: string; save: boolean; file: string }>
  ) => {
    try {
      const inputFile = argv.file.endsWith(".toml")
        ? argv.file
        : `${argv.file}.toml`;
      const configPath = join(process.cwd(), inputFile);

      if (!argv.to.includes("json")) {
        throw new Error(
          "The only supported target formats are 'json' and 'jsonc'."
        );
      }

      const { rawConfig } = experimental_readRawConfig({ config: configPath });

      const jsonConfig: JSONConfig = {
        $schema: "node_modules/wrangler/config-schema.json",
        ...rawConfig,
      };

      const banner = generateBanner(name, homepage);
      const formattedOutput = formatOutput(
        argv.to,
        jsonConfig,
        `${banner}\n${JSON.stringify(jsonConfig, null, 2)}`
      );

      if (argv.save) {
        const outputPath = join(
          process.cwd(),
          `${parse(inputFile).name}.${argv.to}`
        );
        writeFileSync(outputPath, formattedOutput);
        console.log(`✅ Configuration successfully migrated to: ${outputPath}`);
      } else {
        console.log(formattedOutput);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${errorMessage}`);
      process.exit(1);
    }
  },
};

yargs(hideBin(process.argv))
  .command(migrateCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .help().argv;
