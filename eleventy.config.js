import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import pluginPDFEmbed from "eleventy-plugin-pdfembed";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginPDFEmbed, {
    // www subdomain key: "cf2dfbd314014bb2b96663e1e5ac6198",
    key: "3545089f15d94af3a4661706590b5591",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
