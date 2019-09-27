const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "kajoe@live.com",
    subject: "Welcome Aboard! - Eventstag",
    html: `Hello ${name}, <p> We are stoked to have you on board. </p>
    <p>We really hope that you will have a great experience with Eventstag Web application. </p>
    <br><p>Thanks, <p>The Eventstag Team.</p>`
  });
};

const sendDeleteEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "kajoe@live.com",
    subject: "We are definitely going to miss you!",
    html: `Hello ${name}, <p>Its sad to see you leave. But, we will be fine!</p>
    <p>Nonetheless, we hope that your stay with us was worthwhile.</p><br><p>Thanks, <p>The Eventstag Team</p>`
  });
};

module.exports = { sendWelcomeEmail, sendDeleteEmail };
