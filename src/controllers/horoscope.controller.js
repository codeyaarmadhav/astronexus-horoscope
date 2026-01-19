import axios from "axios";

export const getHoroscope = async (req, res) => {
  console.log("🔥 Horoscope route HIT", req.query);

  try {
    let { sign, type = "daily", day = "TODAY" } = req.query;

    if (!sign) {
      return res.status(400).json({
        success: false,
        message: "Zodiac sign is required",
      });
    }

    // 🔒 Normalize inputs
    sign = String(sign).toLowerCase();
    type = String(type).toLowerCase();
    day = String(day).toUpperCase();

    let baseUrl = "https://horoscope-app-api.vercel.app/api/v1/get-horoscope";
    let url = "";

    if (type === "daily") {
      url = `${baseUrl}/daily`;
    } else if (type === "weekly") {
      url = `${baseUrl}/weekly`;
    } else if (type === "monthly") {
      url = `${baseUrl}/monthly`;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid horoscope type",
      });
    }

    console.log("🌐 Fetching URL:", url);

    const response = await axios.get(url, {
      params: {
        sign,
        ...(type === "daily" ? { day } : {}),
      },
      headers: {
        "Accept": "application/json",
        "User-Agent": "AstroNexus/1.0",
      },
      timeout: 15000,
    });

    // 🛡️ Defensive response handling
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response from horoscope provider");
    }

    return res.json({
      success: true,
      type,
      sign,
      data: response.data.data,
    });

  } catch (error) {
    // 🔥 VERY IMPORTANT LOGGING
    console.error("❌ Horoscope API FULL ERROR:", {
      message: error.message,
      code: error.code,
      hostname: error.hostname,
      response: error.response?.data,
    });

    // 🚨 DNS / Network-specific error
    if (error.code === "ENOTFOUND") {
      return res.status(503).json({
        success: false,
        message:
          "Horoscope service unreachable from server network. Try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch horoscope",
    });
  }
};
