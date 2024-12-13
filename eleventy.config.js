import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import pluginPDFEmbed from "eleventy-plugin-pdfembed";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { full } from "markdown-it-emoji/index.mjs";
import MarkdownItTaskCheckbox from "markdown-it-task-checkbox/index.js";

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(full));
  eleventyConfig.amendLibrary("md", (mdLib) =>
    mdLib.use(MarkdownItTaskCheckbox)
  );
  eleventyConfig.addPlugin(pluginPDFEmbed, {
    key: "3545089f15d94af3a4661706590b5591",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
