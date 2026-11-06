import dotenv from "dotenv";

dotenv.config();

const FILE_SERVICE_URL =
  process.env.FILE_SERVICE_URL ||
  "http://localhost:8003";

// =====================================================
// REQUEST
// =====================================================

const request = async (
  url,
  options = {},
  userId
) => {
  console.log(
    "================================="
  );

  console.log(
    "FILE SERVICE REQUEST:",
    options.method || "GET",
    url
  );

  console.log(
    "USER ID:",
    userId
  );

  const response = await fetch(
    url,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(userId
          ? {
              "x-user-id":
                String(userId),
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const text =
    await response.text();

  let data = {};

  try {
    data = text
      ? JSON.parse(text)
      : {};
  } catch {
    data = {
      message: text,
    };
  }

  console.log(
    "FILE SERVICE RESPONSE:",
    response.status,
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `File service returned ${response.status}`
    );
  }

  return data;
};