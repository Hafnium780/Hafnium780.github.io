const authHeader = () => {
  return (
    `OAuth realm="Schoology API",oauth_consumer_key="` +
    key +
    `",oauth_token="",oauth_nonce="` +
    Math.floor(Math.random() * 100000000) +
    `",oauth_timestamp="` +
    Math.floor(Date.now() / 1000) +
    `",oauth_signature_method="PLAINTEXT",oauth_version="1.0",oauth_signature="` +
    signature +
    `%26"`
  );
};

const schoologyHeaders = (fileType) => {
  return {
    Accept: fileType,
    Host: "api.schoology.com",
    Authorization: authHeader(),
    "Content-Type": "text/xml",
  };
};

const getContent = (a) => {
  return new Promise((res, rej) => {
    fetch(
      a.indexOf("https://api.schoology.com") === -1
        ? "https://api.schoology.com/v1/" + a
        : a,
      {
        method: "GET",
        headers: schoologyHeaders("application/json"),
      }
    )
      .then((v) => {
        if (!v.ok) rej(v.status);
        v.json()
          .then((vv) => res(vv))
          .catch((e) => {
            rej(e);
          });
      })
      .catch((e) => {
        rej(e);
      });
  });
};

const getHTML = (a) => {
  return new Promise((res, rej) => {
    fetch(a, {
      method: "GET",
      headers: schoologyHeaders("text/html"),
    })
      .then((v) => {
        v.text()
          .then((vv) => res(vv))
          .catch((e) => {
            rej(e);
          });
      })
      .catch((e) => {
        rej(e);
      });
  });
};

const multiGet = (b) => {
  return new Promise((res, rej) => {
    fetch("https://api.schoology.com/v1/multiget", {
      method: "POST",
      headers: schoologyHeaders("application/json"),
      body: b,
    })
      .then((v) => {
        v.json()
          .then((vv) => res(vv))
          .catch((e) => {
            rej(e);
          });
      })
      .catch((e) => {
        rej(e);
      });
  });
};

let key, signature;

getContent("app-user-info").then((v) => {
  console.log(v);
});

chrome.runtime.onMessage.addListener((req, sender, callback) => {
  console.log(req);
  if (req.type === "setLogin") {
    key = req.key;
    signature = req.signature;
    callback();
  } else if (req.type === "getContent") {
    getContent(req.url).then((v) => {
      console.log(v);
      callback(v);
    });
    return true;
  } else if (req.type === "getHTML") {
    getHTML(req.url).then((v) => {
      console.log(v);
      callback(v);
    });
    return true;
  } else if (req.type === "multiGet") {
    multiGet(req.data).then((v) => {
      console.log(v);
      callback(v);
    });
    return true;
  }
});
