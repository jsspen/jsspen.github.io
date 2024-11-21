import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import pluginPDFEmbed from "eleventy-plugin-pdfembed";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginPDFEmbed, {
    key: "737bbefd6a204008b4f0baadd394847a",
    // key: "02ca93a633fd40fbaca2000bb2d578cb",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
