// ==UserScript==
// @name     		Antided script
// @match      		https://goodgame.ru/
// @match      		https://goodgame.ru/*
// @icon      		https://goodgame.ru/favicon.ico
// @description     Antided script
// @run-at			document-start
// @grant       	GM_addStyle
// @grant       	GM_xmlhttpRequest
// @version         0.0.1
// @author
// ==/UserScript==

const settings = {
    enabled: true,
    messageCheckingInterval: 300, // ms
    maxImagesPerMessage: 2,
    maxTrustedUserId: 1317324,
    placeholderUrl: "https://i.imgur.com/nsjwKdy.jpg",
};

const data = {
    messages: [],
    maxDetectedUserId: null
};

const consts = {
    messageBlockClass: "message-block",
    messageIdAttribute: "tooltip",
    messageChatUserTag: "chat-user",
    regexUserIdPattern: /\d+/g,
    imageSmileClass: "smile"
}

function checkMessages() {
    const messagesAll = document.getElementsByClassName(consts.messageBlockClass);
    for (let messageKey in messagesAll) {
        const msg = messagesAll[messageKey];

        const userId = parseInt(getMessageUserId(msg));
        if (!userId) continue;
        if (!data.maxDetectedUserId || userId > data.maxDetectedUserId) data.maxDetectedUserId = userId;
        if (userId <= settings.maxTrustedUserId) continue;

        let imgCounter = 0;
        const images = msg.getElementsByTagName("img");
        const messagesScope = [];
        for (let imageKey in images) {
            const img = images[imageKey];
            if (!(img && img.tagName)) continue;
            else if (img.classList && img.classList.contains(consts.imageSmileClass)) continue;

            const msgId = userId + "_" + msg.getAttribute(consts.messageIdAttribute) + "_" + (imgCounter++);
            if (data.messages[msgId]) continue;

            data.messages[msgId] = { userId: userId, imgElement: img };
            img.setAttribute("src", settings.placeholderUrl);
            messagesScope.push(data.messages[msgId]);
        }

        if (messagesScope.length <= settings.maxImagesPerMessage) continue;
        for (let messageScopeKey in messagesScope) {
            const ms = messagesScope[messageScopeKey];
            ms.imgElement.setAttribute("src", settings.placeholderUrl);
        }
    }
}

function getMessageUserId(msg) {
    if (!(msg && msg.getElementsByTagName)) return null;
    const chatUserElement = msg.getElementsByTagName(consts.messageChatUserTag)[0];
    if (!chatUserElement) return null;
    const userLinkAttribute = chatUserElement.getElementsByTagName("a")[0].getAttribute("href");
    return userLinkAttribute.match(consts.regexUserIdPattern)[0];
}

window.getMaxUserId = function() { return data.maxDetectedUserId; };

if (settings.enabled) {
    setInterval(checkMessages, settings.messageCheckingInterval);
}