const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "kajoez@hotmail.com",
    subject: "Welcome Aboard!",
    html: `Hello ${name}, <p> We are stoked to have you on board. </p>
    <p>We really hope that you will have a great experience with Eventstag App. </p>
    <br><br>Thanks, <p>The Eventags Team.</p>`
  });
};

const sendDeleteEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "kajoez@hotmail.com",
    subject: "We are definitely going to miss you!",
    // text: `Hello ${name}, Its sad to see you leave. But we will be fine!`,
    html: `Hello ${name}, <p>Its sad to see you leave. But, we will be fine!</p>
    <p>Nonetheless, we hope that your stay with us was worthwhile.</p><br><br>Thanks, <p>Eventags Team</p>`
  });
};

module.exports = { sendWelcomeEmail, sendDeleteEmail };
