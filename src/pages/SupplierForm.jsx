import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';

function SupplierForm({ onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log('Submitting:', data);
      await axios.post('http://localhost:4001/api/suppliers/add', data);
      reset();
      toast.success('Supplier added successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-md rounded-2xl p-8 max-w-xl mx-auto mt-10 space-y-6"
    >
      <Typography variant="h5" className="text-center font-semibold text-blue-800">
        Add New Supplier
      </Typography>

      <Divider className="mb-4" />

      <div className="space-y-6"> {/* Adjusted space-y to 6 for more space */}
        <TextField
          label="Name"
          fullWidth
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
          className="mb-4" // margin-bottom for individual fields
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          {...register('email', { required: 'Email is required' })}
          error={!!errors.email}
          helperText={errors.email?.message}
          className="mb-4" // margin-bottom for individual fields
        />

        <TextField
          label="Phone"
          fullWidth
          {...register('phone', { required: 'Phone is required' })}
          error={!!errors.phone}
          helperText={errors.phone?.message}
          className="mb-4" // margin-bottom for individual fields
        />

        <TextField
          label="Category"
          select
          fullWidth
          defaultValue="Other"
          {...register('category', { required: 'Category is required' })}
          error={!!errors.category}
          helperText={errors.category?.message}
          className="mb-4" // margin-bottom for individual fields
        >
          {[
            'Electronics', 'Spices', 'Clothing',
            'Food & Beverages', 'Office Supplies',
            'Raw Materials', 'Machinery', 'Other'
          ].map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Notes"
          multiline
          rows={3}
          fullWidth
          {...register('notes')}
          className="mb-4" // margin-bottom for individual fields
        />
      </div>

      <Divider className="mt-2" />

      <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
        Add Supplier
      </Button>
    </Box>
  );
}

export default SupplierForm;
