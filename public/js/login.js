"use strict";

const getToken = async () => {
  const url = "/users/login";
  const data = {
    email: document.getElementById("login_email").value,
    password: document.getElementById("login_password").value
  };
  console.log(data);
  return fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-type": "application/json",
      "access-control-allow-origin": "*"
    },
    body: JSON.stringify(data)
  });
};

const login = async () => {
  const res = await getToken();
  if (res.status === 200) {
    const token = await res.send();
    console.log(token);
    localStorage.setItem("Authorization", token);
    window.location.href = "/users";
  } else {
    console.log("Token not saved to localstorage");
    // document.getElementById("errors").style.display = "block";
  }
};
