router.post("/submit", async (req, res) => {
  const ip = req.ip;

  const result = new Result({
    ...req.body,
    ipAddress: ip
  });

  await result.save();
  res.json({ message: "Result Saved" });
});
