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
