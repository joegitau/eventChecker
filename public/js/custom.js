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
