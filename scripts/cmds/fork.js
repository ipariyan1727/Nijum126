const fs = require("fs");
const path = require("path");
const axios = require("axios");

const userCooldowns = new Map();
const COOLDOWN_MS = 3 * 60 * 1000;

function checkAndSetCooldown(senderID) {
	if (!senderID) return true;
	const now = Date.now();
	const lastUsed = userCooldowns.get(senderID) || 0;

	if (now - lastUsed < COOLDOWN_MS) {
		return false;
	}

	userCooldowns.set(senderID, now);
	return true;
}

module.exports = {
	config: {
		name: "fork",
		aliases: [],
		version: "4.2",
		author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
		countDown: 0,
		role: 0,
		shortDescription: {
			bn: "বটের ফোর্ক লিঙ্ক ও আপডেট দেখাবে"
		},
		longDescription: {
			bn: "বটের আপডেট ফোর্ক গিটহাব লিঙ্ক সবাইকে মেনশন দিয়ে নোটিফিকেশন পাঠাবে"
		},
		category: "info",
		guide: {
			bn: ""
		}
	},

	onStart: async function ({ api, event, Threads }) {
		const senderID = event.senderID;
		if (!checkAndSetCooldown(senderID)) return;

		event.__forkHandled = true;
		return await module.exports.sendForkUpdate({ api, event, Threads });
	},

	onChat: async function ({ api, event, Threads }) {
		if (event.__forkHandled) return;

		const { body, senderID } = event;
		if (!body) return;

		const exactForkRegex = /(?:^|[^A-Za-z0-9_])(fork|FORK)(?=$|[^A-Za-z0-9_])/;

		if (!exactForkRegex.test(body.trim())) return;
		if (!checkAndSetCooldown(senderID)) return;

		event.__forkHandled = true;
		return await module.exports.sendForkUpdate({ api, event, Threads });
	},

	sendForkUpdate: async function ({ api, event, Threads }) {
		const { threadID, messageID } = event;
		const videoUrl = "https://files.catbox.moe/lda9ep.mp4";
		const cacheDir = path.join(__dirname, "cache");

		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}

		const videoPath = path.join(cacheDir, `fork_video_${Date.now()}.mp4`);

		const mentionTag = "🚨 𝐍𝐄𝐖 𝐅𝐎𝐑𝐊 𝐔𝐏𝐃𝐀𝐓𝐄";
		const messageBody =
`${mentionTag}
➤ 𝐍𝐞𝐰 𝐅𝐮𝐧 & 𝐔𝐬𝐞𝐟𝐮𝐥 𝐂𝐌𝐃𝐒 
😼 𝐔𝐒𝐄 𝐈𝐓
😁 𝐓𝐇𝐄𝐍 𝐊𝐍𝐎𝐖! 

🔗 𝐆𝐢𝐭𝐇𝐮𝐛
https://github.com/siyam-sys/botV7.git`;

		let loadingMsg = null;
		try {
			loadingMsg = await api.sendMessage("আরে দাঁড়াও মামা দিতেছি!...", threadID, messageID);
		} catch (e) {
			console.error(e);
		}

		const cleanupLoadingMsg = () => {
			if (loadingMsg && loadingMsg.messageID && typeof api.unsendMessage === "function") {
				api.unsendMessage(loadingMsg.messageID, () => {});
			}
		};

		try {
			const response = await axios({
				method: "GET",
				url: videoUrl,
				responseType: "stream"
			});

			const writer = fs.createWriteStream(videoPath);
			response.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on("finish", resolve);
				writer.on("error", reject);
			});

			let threadInfo;
			if (Threads && typeof Threads.getInfo === "function") {
				threadInfo = await Threads.getInfo(threadID);
			} else if (api && typeof api.getThreadInfo === "function") {
				threadInfo = await api.getThreadInfo(threadID);
			}

			let participantIDs = [];
			if (threadInfo) {
				if (Array.isArray(threadInfo.participantIDs) && threadInfo.participantIDs.length > 0) {
					participantIDs = threadInfo.participantIDs;
				} else if (Array.isArray(threadInfo.userInfo) && threadInfo.userInfo.length > 0) {
					participantIDs = threadInfo.userInfo.map(u => u.id || u.facebookID).filter(Boolean);
				}
			}

			const mentions = participantIDs.map(id => ({
				id: id,
				tag: mentionTag
			}));

			return api.sendMessage({
				body: messageBody,
				attachment: fs.createReadStream(videoPath),
				mentions: mentions
			}, threadID, () => {
				cleanupLoadingMsg();
				if (fs.existsSync(videoPath)) {
					fs.unlinkSync(videoPath);
				}
			}, messageID);

		} catch (error) {
			console.error("Fork Command Error:", error);
			cleanupLoadingMsg();
			if (fs.existsSync(videoPath)) {
				fs.unlinkSync(videoPath);
			}
			return api.sendMessage(messageBody, threadID, messageID);
		}
	}
};
