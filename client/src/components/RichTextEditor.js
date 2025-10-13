import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';

const EditorContainer = styled.div`
  .ql-editor {
    min-height: 120px;
    max-height: 200px;
    font-size: 14px;
    line-height: 1.5;
    overflow-y: auto;
  }
  
  .ql-toolbar {
    border-top: 1px solid #e2e8f0;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    border-radius: 8px 8px 0 0;
  }
  
  .ql-container {
    border-bottom: 1px solid #e2e8f0;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    border-radius: 0 0 8px 8px;
    font-size: 14px;
    height: auto;
  }
  
  .ql-editor.ql-blank::before {
    color: #9ca3af;
    font-style: normal;
  }
`;

const RichTextEditor = ({ value, onChange, placeholder = "Enter description...", height = 120 }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'blockquote', 'code-block',
    'link', 'image', 'color', 'background', 'align'
  ];

  return (
    <EditorContainer>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </EditorContainer>
  );
};

export default RichTextEditor;
