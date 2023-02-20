var checked = false;
var tablink;

import { toggleHoverButton } from "./contentScript";

async function getCurrentTabUrl() {
  const tabs = await chrome.tabs.query({ active: true });
  return tabs[0].url;
}

getCurrentTabUrl().then((res) => (tablink = res));

function getCookies(url, name, callback) {
  chrome.cookies.getAll({ url: url, name: name }, function (cookie) {
    if (callback) {
      callback(cookie.value);
    }
  });
}

function setCookies(name, value) {
  chrome.cookies.set({
    url: tablink,
    name: name,
    value: value.toString().toLowerCase(),
  });
}

getCookies(tablink, "checked", function (cookieValue) {
  if (cookieValue) {
    checked = cookieValue === "true";
  } else {
    setCookies("hm__checked", checked);
  }
  document.querySelector("#hm__toggle").checked = checked;
});

function toggleContent() {
  chrome.runtime.sendMessage({ checkbox: checked }, (response) => {
    toggleHoverButton();
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
      // setTimeout(toggleContent, 1000);
    } else {
      checked = !checked;
      setCookies("hm__checked", checked);
    }
  });
}

document.querySelector("#hm__toggle").addEventListener("click", toggleContent);
