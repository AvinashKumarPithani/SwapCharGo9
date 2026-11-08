import { Paper } from '@mui/material';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ImagesList from './ImagesList';
import ProgressList from './progressList/ProgressList';

const AddImages = () => {
  const [files, setFiles] = useState([]);
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });
  return (
    <>
      <Paper
        sx={{
          cursor: 'pointer',
          backgroundColor: 'background.paper',
          color: 'text.secondary',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: 'none',
          '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
        }}
      >
        <div style={{ padding: '16px' }} {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p style={{ color: 'green' }}>Drop the files here...</p>
          ) : (
            <p>Drag 'n' Drop some files here, or click to select files</p>
          )}
          <em>(images with *.jpeg, *.png, *.jpg extension will be accepted)</em>
        </div>
      </Paper>
      <ProgressList {...{ files }} />
      <ImagesList />
    </>
  );
};

export default AddImages;
