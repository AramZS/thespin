require("dotenv").config();

const baseDomain = process.env.SITE_BASE_DOMAIN || "talesfromthesp.in";

let siteUrl = function (baseDomain) {
	console.log("this baseDomain", baseDomain);
	//let port = ''; 
	let port = process.env.PORT ? ':'+process.env.PORT : '';
	const protocol = baseDomain.includes("localhost") ? "http" : "https";
	return `${protocol}://${baseDomain}${port}/`;
};

const exportableObject = {
	site: {
		baseDomain: baseDomain,
		siteUrl: siteUrl(baseDomain),
	},
};

module.exports = exportableObject;
