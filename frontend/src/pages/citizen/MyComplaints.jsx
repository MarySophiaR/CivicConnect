import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import ComplaintCard from "../../components/citizen/ComplaintCard";
import API from "../../api/axios";
import "../../styles/myComplaints.css";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      
      const response = await API.get("/complaints");
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error(
        "Fetch My Complaints Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="my-complaints">
        <h1>My Complaints</h1>

        {loading ? (
          <p>Loading...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints found.</p>
        ) : (
          complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))
        )}
      </div>
    </Layout>
  );
}

export default MyComplaints;