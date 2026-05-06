
export const formateTimeRemaining = (seconds: number) => {
  const mans = Math.floor(seconds / 60);
  const sec = seconds % 60
  return `${mans}:${sec.toString().padStart(2,"0")}`
}
