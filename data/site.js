require("dotenv").config();

const baseDomain = process.env.SITE_BASE_DOMAIN || "talesfromthespin.com";

let siteUrl = function (baseDomain) {
	console.log("this baseDomain", baseDomain);
	const protocol = baseDomain.includes("localhost") ? "http" : "https";
	return `${protocol}://${baseDomain}/`;
};

const exportableObject = {
	site: {
		baseDomain: baseDomain,
		siteUrl: siteUrl(baseDomain),
	},
};

module.exports = exportableObject;
