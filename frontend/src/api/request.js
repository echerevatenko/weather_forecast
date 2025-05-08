export async function requestTemperature(data) {
  try {
    const response = await fetch(
      "http://127.0.0.1:3000/temperature?" +
        new URLSearchParams({
          city: data.city,
          day: data.day,
          time: data.time,
        }).toString(),
    );

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error.message);
    throw new Error(`Request failed: ${error.message}`);
  }
}
