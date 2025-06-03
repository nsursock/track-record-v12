import path from 'path'
import pluginRss from "@11ty/eleventy-plugin-rss" // needed for absoluteUrl SEO feature
import eleventyNavigationPlugin from "@11ty/eleventy-navigation"
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite"
import Image from "@11ty/eleventy-img"
import yaml from "js-yaml" // Because yaml is nicer than json for editors
import * as dotenv from 'dotenv'
import nunjucks from 'nunjucks'
// import UpgradeHelper from "@11ty/eleventy-upgrade-help"

dotenv.config()

// const baseUrl = process.env.BASE_URL || "http://localhost:8080"

// const globalSiteData = {
//   title: "Track Record",
//   tagline: "Groovy wisdom",
//   description: "A music and philosophy blog exploring the deeper connections between sound, rhythm, and meaning. Discover thoughtful reflections on albums, artists, and the philosophical questions music raises.",
//   locale: 'en',
//   baseUrl: baseUrl,
//   env: process.env.NODE_ENV || 'development'
// }

export default function (eleventyConfig) {
  // Set template formats and engines first
  eleventyConfig.setTemplateFormats(["njk", "md", "11ty.js"]);

  // Configure Nunjucks
  const nunjucksEnvironment = nunjucks.configure([
    path.join("src", "includes"),
    path.join("src", "layouts")
  ], {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: true,
    lstripBlocks: true
  });

  eleventyConfig.setLibrary("njk", nunjucksEnvironment);

  /* --- GLOBAL DATA --- */

  // eleventyConfig.addGlobalData("site", globalSiteData);

  /* --- YAML SUPPORT --- */

  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
  eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));

  /* --- PASSTHROUGHS --- */

  eleventyConfig.addPassthroughCopy('src/assets/css')
  eleventyConfig.addPassthroughCopy('src/assets/js')
  // eleventyConfig.addPassthroughCopy('src/data')


  /* --- PLUGINS --- */

  eleventyConfig.addPlugin(pluginRss); // just includes absolute url helper function
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(EleventyVitePlugin, {});

  /* --- SHORTCODES --- */

  eleventyConfig.addFilter('log', function (value) {
    console.log('LOG from Nunjucks:', value);
    return ''; // or return value to render it
  });


  // Image shortcode config
  let defaultSizesConfig = "(min-width: 1200px) 1400px, 100vw"; // above 1200px use a 1400px image at least, below just use 100vw sized image

  eleventyConfig.addShortcode("image", async function (src, alt, sizes = defaultSizesConfig) {
    let metadata = await Image(src, {
      widths: [800, 1500],
      formats: ["webp", "jpeg"],
      urlPath: "/images/",
      outputDir: "./dist/images/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
      }
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  // Output year for copyright notices
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);


  /* --- FILTERS --- */

  // Regex find filter
  eleventyConfig.addFilter("regexFind", function (str, pattern) {
    if (!str) return null;
    const regex = new RegExp(pattern);
    return str.match(regex);
  });

  // Custom Random Helper Filter (useful for ID attributes)
  eleventyConfig.addFilter("generateRandomIdString", function (prefix) {
    return prefix + "-" + Math.floor(Math.random() * 1000000);
  });

  // Sort posts by date in descending order
  eleventyConfig.addFilter("sortByDate", function (posts) {
    return posts.sort((a, b) => {
      return new Date(b.data.published_date) - new Date(a.data.published_date);
    });
  });

  // Format date
  eleventyConfig.addFilter("formatDate", function (date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  });

  /* --- DATA TRANSFORMATIONS --- */

  /* --- COLLECTIONS --- */

  // Create a collection of all posts
  eleventyConfig.addCollection("post", function (collection) {
    return collection.getFilteredByGlob("src/posts/**/*.md")
      .sort((a, b) => new Date(b.data.published_date) - new Date(a.data.published_date));
  });

  // // Debug logging for template processing
  // eleventyConfig.on('eleventy.before', async ({ runMode, outputMode, results }) => {
  //   console.log('Template engine:', eleventyConfig.templateEngine);
  // });

  // // Debug logging for template rendering
  // eleventyConfig.on('eleventy.after', async ({ runMode, outputMode, results }) => {
  //   console.log('Generated files:', results.map(r => r.outputPath));
  // });

  // // Debug logging for file processing
  // eleventyConfig.on('eleventy.beforeWatch', async (changedFiles) => {
  //   console.log('Files being processed:', changedFiles);
  // });

  // If you have other `addPlugin` calls, it's important that UpgradeHelper is added last.
  // eleventyConfig.addPlugin(UpgradeHelper);

  /* --- BASE CONFIG --- */

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "includes", // this path is releative to input-path (src/)
      layouts: "layouts", // this path is releative to input-path (src/)
      data: "data", // this path is releative to input-path (src/)
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    jsTemplateEngine: "njk",
  };
}