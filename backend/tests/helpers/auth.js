import jwt from "jsonwebtoken";

/**
 * Generates an Access Token and Authorization headers/cookies for a test user.
 */
export const getAuthToken = (user) => {
  const secret =
    process.env.ACCESS_TOKEN_SECRET ||
    "test_access_token_secret_123456789_test";
  const token = jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      fullname: user.fullname,
    },
    secret,
    {
      expiresIn: "1d",
    }
  );
  return token;
};

export const getAuthHeaders = (user) => {
  const token = getAuthToken(user);
  return {
    Authorization: `Bearer ${token}`,
    Cookie: [`accessToken=${token}`],
  };
};
