export function getDiscordLinkForUser(user) {
  const defaultLink = "https://discord.gg/sAPGDmzacw";
  if (!user) {
    return defaultLink;
  }

  if (user.is_legacy_user) {
    return "https://discord.gg/FbBvVkuY8j";
  }

  if (user.plan_name?.toLowerCase().includes("team")) {
    return "https://discord.gg/ynkZTZyyeJ";
  }

  return defaultLink;
}