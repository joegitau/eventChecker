async function updateUser(name, email, company, phone, address) {
  try {
    const res = await axios({
      method: "PUT",
      url: "/users/me",
      data: { name, email, company, phone, address }
    });
    if (res.data.status === 200)
      console.log({ success: "Successfully updated" });
  } catch (err) {
    console.log({ error: err.response.data.message });
  }
}

const updateForm = document
  .getElementById("userForm_update")
  .addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value,
      email = document.getElementById("email").value,
      phone = document.getElementById("phone").value,
      address = document.getElementById("address").value,
      company = document.getElementById("company").value;

    updateUser(name, email, company, phone, address);
  });
