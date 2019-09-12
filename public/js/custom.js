/***********
 * USERS
 * ********* */

// REGISTER
function register() {
  const registerUser = async (
    name,
    email,
    password,
    phone,
    address,
    company
  ) => {
    try {
      const result = await axios({
        method: "POST",
        url: "/users/register",
        data: { name, email, password, phone, address, company }
      });
      console.log(result);
    } catch (err) {
      console.log({ error: err.response.data });
    }
  };

  document.getElementById("userForm_register").addEventListener("submit", e => {
    e.preventDefault();
    // console.log("clicked");
    const name = document.getElementById("register_name").value,
      email = document.getElementById("register_email").value,
      password = document.getElementById("register_password").value,
      phone = document.getElementById("register_phone").value,
      address = document.getElementById("register_address").value,
      company = document.getElementById("register_company").value;

    registerUser(name, email, password, phone, address, company);
  });
}

// CURRENT USER
// function currentUser() {
//   const me = () => {

//   }
// }

// UPDATE
function update() {
  const updateUser = async (name, email, password, phone, address, company) => {
    try {
      axios({
        method: "PUT",
        url: "users/:id",
        data: { name, email, password, phone, address, company }
      });
    } catch (err) {
      console.log({ error: err.response.data });
    }
  };

  document.getElementById("userForm_update").addEventListener("submit", e => {
    e.preventDefault();
    // console.log("clicked");
    const name = document.getElementById("update_name").value,
      email = document.getElementById("update_email").value,
      password = document.getElementById("update_password").value,
      phone = document.getElementById("update_phone").value,
      address = document.getElementById("update_address").value,
      company = document.getElementById("update_company").value;

    updateUser(name, email, password, phone, address, company);
  });
}

// DELETE

// LOGIN
function login() {
  const loginUser = async (email, password) => {
    try {
      const res = await axios({
        method: "POST",
        url: "/users/login",
        data: { email, password }
      });
      console.log(res);
    } catch (err) {
      console.log({ error: err.response.data });
    }
  };

  document.getElementById("userForm_login").addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;

    loginUser(email, password);
  });
}

login();

register();
update();
