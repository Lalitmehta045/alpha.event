export const maskedEmail = (email?: string) => {
  if (!email || !email.includes("@")) return "";

  const [name, domain] = email.split("@");

  if (!name || !domain) return "";

  if (name.length <= 2) {
    return `**@${domain}`;
  }

  return `${"*".repeat(name.length - 2)}${name.slice(-2)}@${domain}`;
};
