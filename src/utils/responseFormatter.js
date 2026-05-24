const responseFormatter = {
  success: (data, message = "Success", statusCode = 200) => {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  },
  error: (message = "Error", statusCode = 500, errors = null) => {
    return {
      success: false,
      statusCode,
      message,
      ...(errors && { errors }),
    };
  },
};

module.exports = responseFormatter;
