module.exports = {
  port: process.env.PORT,
  prefixApiVersion: process.env.PREFIX_API_VERSION,
  default_limit_page: 10,
  static_folder: `${__dirname}/../src/public`,
};
