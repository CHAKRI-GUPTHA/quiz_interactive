const handleLogin = async () => {

  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: id,
      password: password,
      role: role
    })
  });

  const data = await response.json();

  if (response.ok) {
    if (role === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  } else {
    setMessage(data.message);
  }
};
