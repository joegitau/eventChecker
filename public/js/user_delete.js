console.log("Delete logic");
async function deleteUser(user) {
  try {
    const res = await axios({
      method: "DELETE",
      url: "/users/me",
      data: { user }
    });
    if (res.data.status === 200)
      console.log({ success: "Successfully deleted" });
  } catch (err) {
    console.log({ error: err.response.data.message });
  }
}

const deleteForm = document
  .getElementById("user_delete")
  .addEventListener("submit", e => {
    e.preventDefault();
    deleteUser(user);
  });
