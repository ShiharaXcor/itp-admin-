import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from "@mui/material";

const UserClient = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/user/all`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch failed:", errorText);
        setErrorMsg(`Error ${res.status}: ${errorText}`);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setErrorMsg("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMsg("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <Paper className="p-6 shadow-md rounded-2xl bg-white">
        <Typography variant="h4" className="text-blue-800 font-bold mb-6">
          Registered Users
        </Typography>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <CircularProgress />
          </div>
        ) : errorMsg ? (
          <Alert severity="error">{errorMsg}</Alert>
        ) : users.length === 0 ? (
          <Typography>No users found.</Typography>
        ) : (
          <TableContainer component={Paper} className="rounded-xl shadow-sm">
            <Table>
              <TableHead className="bg-gray-100">
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Contact</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.businessName}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>{user.contact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );
};

export default UserClient;
