const db = require("../db");
const SpotifyDataService = require("../services/SpotifyData.service");

async function spotifyAuth(req, res, next) {
  try {
    const collection = await db.get("token");
    const query = await collection.findOne();

    if (!query) {
      // No token present in database, create it
      await SpotifyDataService.issueToken();
      return next();
    } else {
      // Token present in database, check if expired by checking if currentTime is greater than expirationDate
      const { token, expirationDate } = query;
      const current = new Date();
      const expiration = new Date(expirationDate);

      if (current >= expiration) {
        // Token is expired, delete the old token and issue a new one
        await collection.remove({ token: token });
        await SpotifyDataService.issueToken();
        return next();
      } else {
        // Token is not expired, proceed with request
        return next();
      }
    }
  } catch (error) {
    console.log("Spotify Auth Middleware error:", error);
  }
}

module.exports = spotifyAuth;