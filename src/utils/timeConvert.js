const convertUtcToLocalTime = (utcTime) => {
  const time = new Date(utcTime);
  const hours = String(time.getUTCHours()).padStart(2, '0');
  const minutes = String(time.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default convertUtcToLocalTime;
