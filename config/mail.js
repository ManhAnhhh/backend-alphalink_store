// scgr weet pfpp iwip

module.exports = {
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.MAIL_USER || "quantri.vietproshop@gmail.com",
    pass: process.env.MAIL_PASSWORD || "tjpjrclgithnrkby",
  },
};
