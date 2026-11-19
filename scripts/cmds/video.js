const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
const VIDEO_API_BASE = "https://eryxenx.agi.bd/api/video";

async function fetchVideoInfo(videoUrl) {
	const infoRes = await axios.get(VIDEO_API_BASE, {
		params: { url: videoUrl },
		timeout: 60000
	});

	const data = infoRes.data;
	if (!data?.success || !data?.downloadUrl) {
		throw new Error(data?.error || "downloadUrl paoa jayni API response e");
	}
	return data;
}

async function streamDownloadToFile(dlUrl, filePath) {
	if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

	const response = await axios.get(dlUrl, {
		responseType: "stream",
		timeout: 300000,
		maxContentLength: Infinity,
		maxBodyLength: Infinity,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
		}
	});

	const contentType = response.headers["content-type"] || "";
	const isValid = contentType.includes("video") || contentType.includes("octet-stream");

	if (!isValid) {
		let bodyText = "";
		try {
			const chunks = [];
			for await (const chunk of response.data) {
				chunks.push(chunk);
				if (Buffer.concat(chunks).length > 2000) break;
			}
			bodyText = Buffer.concat(chunks).toString("utf-8").slice(0, 500);
		} catch (_) {}

		throw new Error(`Invalid content received from downloadUrl (type: ${contentType})` + (bodyText ? ` — upstream said: "${bodyText.trim()}"` : ""));
	}

	const writer = fs.createWriteStream(filePath);

	await new Promise((resolve, reject) => {
		response.data.pipe(writer);
		let failed = false;
		const onError = (err) => {
			if (failed) return;
			failed = true;
			writer.close();
			fs.unlink(filePath, () => {});
			reject(err);
		};
		response.data.on("error", onError);
		writer.on("error", onError);
		writer.on("close", () => { if (!failed) resolve(); });
	});

	const stats = fs.statSync(filePath);
	if (stats.size < 1024) {
		fs.unlink(filePath, () => {});
		throw new Error(`Downloaded file too small (${stats.size} bytes) — corrupt ba failed download`);
	}
}

function extractApiErrorMessage(err) {
	const raw = err.response?.data;
	if (raw && typeof raw === "object" && !Buffer.isBuffer(raw)) {
		if (raw.error) return raw.error;
		if (raw.message) return raw.message;
	}
	if (raw) {
		try {
			const text = Buffer.isBuffer(raw) ? raw.toString("utf-8") : String(raw);
			const parsed = JSON.parse(text);
			if (parsed?.error) return parsed.error;
			if (parsed?.message) return parsed.message;
		} catch (_) {}
	}
	return err.message;
}

function tempFilePath(ext) {
	if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
	return path.join(CACHE_DIR, `video_${Date.now()}_${Math.floor(Math.random() * 1e4)}.${ext}`);
}

async function sendWithRetry(message, msg, retries = 2) {
	for (let i = 0; i <= retries; i++) {
		try {
			return await message.reply(msg);
		} catch (err) {
			const is408 = err?.error === 408 || String(err?.message || err).includes("408");
			if (is408 && i < retries) {
				await new Promise(r => setTimeout(r, 2000));
				continue;
			}
			throw err;
		}
	}
}

module.exports = {
	config: {
		name: "video",
		aliases: ["videos", "ytvideo"],
		version: "2.2.1",
		author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
		countDown: 5,
		role: 0,
		shortDescription: { en: "Search and download a YouTube video" },
		longDescription: { en: "Search and download the top matching YouTube video automatically." },
		category: "media",
		guide: { en: "{pn} <video name>" }
	},

	onStart: async function ({ message, args, event, api }) {
		const query = args.join(" ");
		if (!query) {
			api.setMessageReaction("❌", event.messageID);
			return message.reply(`❌ Please provide a video name.\n📌 Example: video Let Me Love You`);
		}

		api.setMessageReaction("🔍", event.messageID);

		let tempMsg = null;
		let file;

		try {
			tempMsg = await message.reply(
				`🔍 𝐒𝐄𝐀𝐑 𝐂𝐇𝐢𝐍𝐆\n━━━━━━━━━━━━━━━\n📌 𝐐𝐍𝐄𝐑𝐘: ${query}\n⏳ 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐢𝐓...`
			);

			const search = await yts(query);
			const video = search.videos?.[0];
			if (!video) {
				if (tempMsg?.messageID) await api.unsendMessage(tempMsg.messageID).catch(() => {});
				api.setMessageReaction("❌", event.messageID);
				return message.reply(`❌ 𝐅𝐀𝐈𝐋𝐄𝐃\n━━━━━━━━━━━━━━━\n𝐍𝐎 𝐕𝐈𝐃𝐄𝐎𝐒 𝐅𝐎𝐔𝐍𝐃 𝐅𝐎𝐑 𝐘𝐎𝐔𝐑 𝐐𝐔𝐄𝐑𝐘.`);
			}

			if (tempMsg?.messageID) await api.unsendMessage(tempMsg.messageID).catch(() => {});
			api.setMessageReaction("⏳", event.messageID);

			tempMsg = await message.reply(
				`🎬 𝐕𝐈𝐃𝐄𝐎 𝐅𝐎𝐔𝐍𝐃\n━━━━━━━━━━━━━━━\n📖 𝐓𝐢𝐭𝐋𝐄: ${infoTitleFallback(video.title)}\n⬇️ 𝐃𝐨𝐰𝐧𝐋𝐎𝐚𝐝𝐧𝐠...`
			);

			const info = await fetchVideoInfo(video.url);
			file = tempFilePath("mp4");
			await streamDownloadToFile(info.downloadUrl, file);

			const title = info.title || video.title || "Unknown";
			const duration = video.timestamp || video.duration?.timestamp || "N/A";

			await sendWithRetry(message, {
				body:
					`━━━━━━━━━━━━━━━━━━\n` +
					`🎬 𝐕𝐈𝐃𝐄𝐎 𝐑𝐄𝐀𝐃𝐘 𝐕𝐈𝐃𝐄𝐎\n` +
					`━━━━━━━━━━━━━━━━━━\n` +
					`📖 𝐓𝐈𝐭𝐋𝐄: ${title}\n` +
					`⏱ 𝐃𝐔𝐑𝐀𝐓𝐈𝐎𝐍: ${duration}\n` +
					`🖌️ 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌 𝐇𝐀𝐒𝐀𝐍\n` +
					`━━━━━━━━━━━━━━━━━━`,
				attachment: fs.createReadStream(file)
			});

			if (tempMsg?.messageID) await api.unsendMessage(tempMsg.messageID).catch(() => {});
			api.setMessageReaction("✅", event.messageID);
		} catch (e) {
			if (tempMsg?.messageID) await api.unsendMessage(tempMsg.messageID).catch(() => {});
			console.error("[VIDEO COMMAND ERROR]:", e?.response?.data || e.message || e);
			api.setMessageReaction("❌", event.messageID);
			message.reply(`❌ 𝐅𝐀𝐈𝐋𝐄𝐃\n━━━━━━━━━━━━━━━\n𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃: ${extractApiErrorMessage(e)}`);
		} finally {
			if (file) fs.unlink(file, () => {});
		}
	}
};

function infoTitleFallback(title) {
	return title || "Loading...";
}
