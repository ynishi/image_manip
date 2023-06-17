import sharp from "sharp";
import fs from "fs";
import path from "path";

function generateOutputFilePath(
  inputFile: string,
  outputDir: string,
  newExt: string
): string {
  // Get the base name of the input file
  const baseName = path.basename(inputFile, path.extname(inputFile));

  // Construct the output file path
  const outputFile = path.join(outputDir, `${baseName}.${newExt}`);

  return outputFile;
}

const util = require("util");

const convert = require("heic-convert");
async function heicToPng(file: string, outputDir: string) {
  const outputFile = generateOutputFilePath(file, outputDir, "png");
  const inputBuffer = await util.promisify(fs.readFile)(file);
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: "PNG", // output format
  });
  await util.promisify(fs.writeFile)(outputFile, outputBuffer);
}

function toPng(inputFile: string, outputDir: string) {
  const outputFile = generateOutputFilePath(inputFile, outputDir, "png");
  sharp(inputFile)
    .png()
    .toFile(outputFile, (err: any, info: any) => {
      if (err) {
        console.log("An error occurred:", err);
      } else {
        console.log("Image was successfully converted:", info);
      }
    });
}

const workDir = process.argv[2] ?? ".";

function getPath(...p: string[]): string {
  return path.join(workDir, ...p);
}

fs.readdir("input", (err, files) => {
  files.forEach((dirOrFile) => {
    const fp = getPath("input", dirOrFile);
    const istat = fs.statSync(fp);
    if (!istat.isDirectory()) return;
    const outputDir = getPath("output", dirOrFile);
    if (fs.existsSync(outputDir)) return;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.readdir(fp, (err, files) => {
      files.forEach((file) => {
        const input = path.join(fp, file);
        if (file.endsWith("heic")) {
          (async () => {
            console.log(input);
            await heicToPng(input, outputDir);
          })();
        } else {
          toPng(input, outputDir);
        }
      });
    });
  });
});
