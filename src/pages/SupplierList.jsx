import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Container, Tooltip, TextField
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('http://localhost:4001/api/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch suppliers');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await axios.delete(`http://localhost:4001/api/suppliers/${id}`);
      toast.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete supplier');
    }
  };

  const handleEditClick = (supplier) => {
    setEditingId(supplier._id);
    setEditData({ ...supplier });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:4001/api/suppliers/${editingId}`, editData);
      toast.success('Supplier updated successfully');
      setEditingId(null);
      setEditData({});
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update supplier');
    }
  };

  const handleChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Container className="mt-12">
      <Typography variant="h4" align="center" gutterBottom>
        Supplier List
      </Typography>

      <TableContainer component={Paper} className="shadow-md rounded-xl mt-6">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => {
              const isEditing = editingId === supplier._id;
              return (
                <TableRow key={supplier._id}>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={editData.name}
                        name="name"
                        onChange={handleChange}
                        size="small"
                      />
                    ) : supplier.name}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={editData.email}
                        name="email"
                        onChange={handleChange}
                        size="small"
                      />
                    ) : supplier.email}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={editData.phone}
                        name="phone"
                        onChange={handleChange}
                        size="small"
                      />
                    ) : supplier.phone}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={editData.category}
                        name="category"
                        onChange={handleChange}
                        size="small"
                      />
                    ) : supplier.category}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <>
                        <Tooltip title="Save">
                          <IconButton color="success" onClick={handleSave}>
                            <Save />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton color="inherit" onClick={handleCancel}>
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => handleEditClick(supplier)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(supplier._id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default SupplierList;
