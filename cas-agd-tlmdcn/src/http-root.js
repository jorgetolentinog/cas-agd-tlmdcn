module.exports.handler = async function () {
  return {
    statusCode: 403,
    body: JSON.stringify({ message: "Forbidden" }),
  };
};
