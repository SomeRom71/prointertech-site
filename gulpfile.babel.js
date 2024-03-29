"use strict";

import { src, dest, watch, parallel, series } from "gulp";
import gulpif from "gulp-if";
import browsersync from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import babel from "gulp-babel";
import browserify from "browserify";
import watchify from "watchify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import uglify from "gulp-uglify";
import pug from "gulp-pug";
import sass from "gulp-sass";
import groupmediaqueries from "gulp-group-css-media-queries";
import mincss from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
import favicons from "gulp-favicons";
import svgSprite from "gulp-svg-sprite";
import replace from "gulp-replace";
import plumber from "gulp-plumber";
import debug from "gulp-debug";
import clean from "gulp-clean";
import yargs from "yargs";

const argv = yargs.argv;
const production = !!argv.production;

const paths = {
	views: {
		src: [
			"./src/views/index.pug",
			"./src/views/pages/*.pug"
		],
		dist: "./dist/",
		watch: "./src/views/**/*.pug"
	},
	styles: {
		src: "./src/styles/main.scss",
		dist: "./dist/styles/",
		watch: "./src/styles/**/*.scss"
	},
	scripts: {
		src: "./src/js/main.js",
		dist: "./dist/js/",
		watch: "./src/js/**/*.js"
	},
	images: {
		src: [
			"./src/img/**/*.{jpg,jpeg,png,gif,svg}",
			"!./src/img/svg/*.svg",
			"!./src/img/favicon.{jpg,jpeg,png,gif}"
		],
		dist: "./dist/img/",
		watch: "./src/img/**/*.{jpg,jpeg,png,gif,svg}"
	},
	fonts: {
		src: [
			"./src/fonts/**/*"
		],
		dist: "./dist/fonts/",
		watch: "./src/fonts/**/*"
	},
	sprites: {
		src: "./src/img/svg/*.svg",
		dist: "./dist/img/sprites/",
		watch: "./src/img/svg/*.svg"
	},
	favicons: {
		src: "./src/img/favicon.{jpg,jpeg,png,gif}",
		dist: "./dist/img/favicons/",
	},
	server_config: {
		src: "./src/.htaccess",
		dist: "./dist/"
	}
};


export const server = () => {
	browsersync.init({
		server: "./dist/",
		port: 4000,
		tunnel: true,
		notify: true
	});
};

export const watchCode = () => {
	watch(paths.views.watch, views);
	watch(paths.styles.watch, styles);
	watch(paths.scripts.watch, scripts);
	watch(paths.images.watch, images);
	watch(paths.sprites.watch, sprites);
};

export const cleanFiles = () => src("./dist/**/", {read: false})
	.pipe(clean())
	.pipe(debug({
		"title": "Cleaning..."
	}));

export const serverConfig = () => src(paths.server_config.src)
	.pipe(dest(paths.server_config.dist))
	.pipe(debug({
		"title": "Server config"
	}));

export const views = () => src(paths.views.src)
	.pipe(pug({pretty: true}))
	.pipe(gulpif(production, replace("main.css", "main.min.css")))
	.pipe(gulpif(production, replace("main.js", "main.min.js")))
	.pipe(dest(paths.views.dist))
	.on("end", browsersync.reload);

export const styles = () => src(paths.styles.src)
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(plumber())
	.pipe(sass())
	.pipe(groupmediaqueries())
	.pipe(gulpif(production, autoprefixer({
		browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]
	})))
	.pipe(gulpif(production, mincss({
		compatibility: "ie8", level: {
			1: {
				specialComments: 0,
				removeEmpty: true,
				removeWhitespace: true
			},
			2: {
				mergeMedia: true,
				removeEmpty: true,
				removeDuplicateFontRules: true,
				removeDuplicateMediaBlocks: true,
				removeDuplicateRules: true,
				removeUnusedAtRules: false
			}
		}
	})))
	.pipe(gulpif(production, rename({
		suffix: ".min"
	})))
	.pipe(plumber.stop())
	.pipe(gulpif(!production, sourcemaps.write("./maps/")))
	.pipe(dest(paths.styles.dist))
	.pipe(debug({
		"title": "CSS files"
	}))
	.pipe(browsersync.stream());

export const scripts = () => {
	let bundler = browserify({
		entries: paths.scripts.src,
		cache: { },
		packageCache: { },
		fullPaths: true,
		debug: true
	}).transform("babelify", {
		presets: [
			"@babel/preset-env"
		]
	});

	const bundle = () => {
		return bundler
			.bundle()
			.on("error", function () {})
			.pipe(source("main.js"))
			.pipe(buffer())
			.pipe(gulpif(!production, sourcemaps.init()))
			.pipe(babel())
			.pipe(gulpif(production, uglify()))
			.pipe(gulpif(production, rename({
				suffix: ".min"
			})))
			.pipe(gulpif(!production, sourcemaps.write("./maps/")))
			.pipe(dest(paths.scripts.dist))
			.pipe(debug({
				"title": "JS files"
			}))
			.on("end", browsersync.reload);
	};

	if(global.isWatching) {
		bundler = watchify(bundler);
		bundler.on("update", bundle);
	}

	return bundle();
};

export const images = () => src(paths.images.src)
	.pipe(gulpif(production, imagemin([
		imageminGiflossy({
			optimizationLevel: 3,
			optimize: 3,
			lossy: 2
		}),
		imageminPngquant({
			speed: 5,
			quality: 75
		}),
		imageminZopfli({
			more: true
		}),
		imageminMozjpeg({
			progressive: true,
			quality: 70
		}),
		imagemin.svgo({
			plugins: [
				{ removeViewBox: false },
				{ removeUnusedNS: false },
				{ removeUselessStrokeAndFill: false },
				{ cleanupIDs: false },
				{ removeComments: true },
				{ removeEmptyAttrs: true },
				{ removeEmptyText: true },
				{ collapseGroups: true }
			]
		})
	])))
	.pipe(dest(paths.images.dist))
	.pipe(debug({
		"title": "Images"
	}))
	.on("end", browsersync.reload);

export const sprites = () => src(paths.sprites.src)
	.pipe(svgSprite({
		mode: {
			stack: {
				sprite: "../sprite.svg"
			}
		}
	}))
	.pipe(dest(paths.sprites.dist))
	.pipe(debug({
		"title": "Sprites"
	}))
	.on("end", browsersync.reload);

export const fonts = () => src(paths.fonts.src)
	.pipe(dest(paths.fonts.dist))
	.on("end", browsersync.reload);

export const favs = () => src(paths.favicons.src)
	.pipe(favicons({
		icons: {
			appleIcon: true,
			favicons: true,
			online: false,
			appleStartup: false,
			android: false,
			firefox: false,
			yandex: false,
			windows: false,
			coast: false
		}
	}))
	.pipe(dest(paths.favicons.dist))
	.pipe(debug({
		"title": "Favicons"
	}));

export const development = series(cleanFiles, parallel(views, styles, fonts, scripts, images, sprites, favs),
	parallel(watchCode, server));

export const prod = series(cleanFiles, serverConfig, views, styles, fonts, scripts, images, sprites, favs);

export default development;
