🛠️ Built-in Functions:

* Translate
* convertTime
* enable/disable process.stderr.clearLine
* getExtFromMimeType
* getTime
* jsonStringifyColor
* randomString/Number
* findUid Facebook
* getStreamsFromAttachment
* getStreamFromURL
* Google Drive: (upload, delete, getFile, etc...)
* And more...
  See "utils.js" (https://github.com/siyam-sys/botV7/blob/main/utils.js) for more details.

<hr>🤧 Prepare

- "Node.js" (https://nodejs.org/en/download/) 16.x
- IDE or Text Editor (VSCode, Sublime Text, Atom, Notepad++, ...)
- Knowledge of Javascript, Node.js, JSON,...
- Knowledge of "Facebook Chat API Unofficial" (https://github.com/ntkhang03/fb-chat-api/blob/master/DOCS.md)

⚠️ Important Note

- Any issues related to 18+, vulgarity, obscenity, pornography, treason, politics, etc., are not allowed in SIYAM BOT V7. Adding custom commands or modifying the code to violate these rules may result in restrictions. Please be cautious with each line of your code.

<hr>💾 Database

Type: You can choose one of the following storage methods, config at "config.json" (https://github.com/siyam-sys/botV7/blob/main/config.json)

* "JSON" (https://www.json.org/json-en.html) or "SQLite" (https://www.sqlite.org/) or "MONGODB" (https://www.mongodb.com/docs/manual/core/document/)
* Basic usages:

<details>
	<summary>
		<b><i>Users</i></b>
	</summary>
	<i>See more details at <a href="https://github.com/siyam-sys/botV7/blob/main/database/controller/usersData.js">usersData.js</a></i>
	<br />
	<br />// CREATE USER DATA
const newUserData = await usersData.create(userID, userInfo);
// userInfo is data get by (await api.getUserInfo(userID))[userID] method or undefined is auto

// GET USER DATA
const userData = await usersData.get(userID);

// SET USER DATA
await userData.set(userID, updateData, path);

// Example 1
// set data with path
await usersData.set(4, { banned: true }, "data");

// set data without path
const userData = await usersData.get(userID);
userData.data = {
	banned: true
};
await usersData.set(4, {
	data: userData.data
});

// Example 2
// set data with path
await usersData.set(4, {
	name: "ABC",
	birthday: "01/01/1999"
}, "data.relationship.lover");

// set data without path
const userData = await usersData.get(userID);
userData.data.relationship.lover = {
	name: "ABC",
	birthday: "01/01/1999"
};
await usersData.set(userID, {
	data: userData.data
});

// GET ALL USER DATA
const allUsers = await usersData.getAll();

// GET USER NAME
const userName = await usersData.getName(userID);

// GET USER AVATAR URL
const avatarUrl = await usersData.getAvatarUrl(userID);

// REFRESH INFO USER
await usersData.refreshInfo(userID, updateData);

// REMOVE USER DATA
await usersData.remove(userID);

</details><details>
	<summary>
		<b><i>Threads</i></b>
	</summary>
	<i>See more details at <a href="https://github.com/siyam-sys/botV7/blob/main/database/controller/threadsData.js">threadsData.js</a></i>
	<br />
	<br />// CREATE THREAD DATA
const newThreadData = await threadsData.create(threadID, threadInfo);

// GET THREAD DATA
const threadData = await threadsData.get(threadID);

// GET ALL THREAD DATA
const allThreads = await threadsData.getAll();

// GET THREAD NAME
const threadName = threadData.threadName;

// SET THREAD DATA
await threadsData.set(threadID, updateData, path);

// Example 1
await threadsData.set(2000000000000000, "Hello", "data.welcomeMessage");

// REFRESH THREAD DATA
await threadsData.refreshInfo(threadID, threadInfo);

</details><hr>📦 Create New Command

🇧🇩 বাংলা

* প্রথমে JavaScript সম্পর্কে ধারণা থাকতে হবে, যেমন variables, functions, loops, arrays, objects, promises, async/await ইত্যাদি। শিখতে পারো "MDN JavaScript" (https://developer.mozilla.org/en-US/docs/Web/JavaScript) থেকে।
* এরপর Node.js সম্পর্কে জানতে হবে, যেমন require, module.exports ইত্যাদি। বিস্তারিত "Node.js Documentation" (https://nodejs.org/en/docs/)।
* Facebook Unofficial API সম্পর্কে জানতে হবে, যেমন api.sendMessage, api.changeNickname ইত্যাদি। বিস্তারিত "Facebook Chat API" (https://github.com/ntkhang03/fb-chat-api/blob/master/DOCS.md)।
* ফাইলের নাম ".eg.js" দিয়ে শেষ হলে সেটি বটের মধ্যে লোড হবে না। লোড করতে চাইলে ".js" এক্সটেনশন ব্যবহার করতে হবে।

🇬🇧 English

* First, you need knowledge of JavaScript, such as variables, functions, loops, arrays, objects, promises, async/await, etc. Learn more at "MDN JavaScript" (https://developer.mozilla.org/en-US/docs/Web/JavaScript).
* Next, you need knowledge of Node.js, such as require and module.exports. Learn more at "Node.js Documentation" (https://nodejs.org/en/docs/).
* You also need knowledge of the unofficial Facebook API, such as api.sendMessage and api.changeNickname. Learn more at "Facebook Chat API" (https://github.com/ntkhang03/fb-chat-api/blob/master/DOCS.md).
* If a filename ends with ".eg.js", it will not be loaded into the bot. Change the extension to ".js" to load it.

Start Creating a New Command

* Reference available commands: "Commands" (https://github.com/siyam-sys/botV7/tree/main/scripts/cmds) and "Events" (https://github.com/siyam-sys/botV7/tree/main/scripts/events).
* Command example: "newcommand.eg.js" (https://github.com/siyam-sys/botV7/blob/main/scripts/cmds/newcommand.eg.js).
* Event example: "newcommandevent.eg.js" (https://github.com/siyam-sys/botV7/blob/main/scripts/events/newcommandevent.eg.js).
* In VS Code, you can create a new command using snippets:
  "GoatBotCommandCreate" or "GoatBotEventCreate" (press <kbd>Tab</kbd> to jump to the next placeholder).

<img src="https://i.ibb.co/VTstrSy/Animation.gif" width="400px" /><hr>🚀 Updating...

---

© SIYAM BOT V7

Project Owner & Maintainer: SIYAM
GitHub: https://github.com/siyam-sys
Repository: https://github.com/siyam-sys/botV7

Original Author: NTKhang
Original Source: https://github.com/ntkhang03/Goat-Bot-V2

Please respect the original author's credits and contributions. All original modifications and additions by SIYAM are credited to SIYAM.
