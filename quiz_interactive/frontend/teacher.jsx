import React from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {

  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      <h1 style={styles.heading}>Teacher Dashboard</h1>

      <div style={styles.cardContainer}>

        <div style={styles.card} onClick={() => navigate("/create-quiz")}>
          <h3>Create Quiz</h3>
          <p>Create new quiz with ID, subject, timer & questions</p>
        </div>

        <div style={styles.card} onClick={() => navigate("/upload-material")}>
          <h3>Upload Material</h3>
          <p>Add study materials for students</p>
        </div>

        <div style={styles.card} onClick={() => navigate("/view-results")}>
          <h3>View Results</h3>
          <p>Check student marks and performance</p>
        </div>

        <div style={styles.card} onClick={() => navigate("/view-students")}>
          <h3>View Students</h3>
          <p>See all students who attended quiz & IP address</p>
        </div>

      </div>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    padding: "40px",
    textAlign: "center"
  },
  heading: {
    marginBottom: "40px"
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#111",
    padding: "30px",
    borderRadius: "12px",
    cursor: "pointer",
    border: "1px solid #00f2ff",
    transition: "0.3s",
  }
};
