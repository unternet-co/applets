export function getTime(timezoneString: string) {
  const now = new Date();
  const options = { timeZone: timezoneString };
  const timestampInTimezone = now.toLocaleString('en-US', options);
  const dateInTimezone = new Date(timestampInTimezone);
  return dateInTimezone.getTime();
}
