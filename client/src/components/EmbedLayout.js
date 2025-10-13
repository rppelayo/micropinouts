import React from 'react';
import { Outlet } from 'react-router-dom';

const EmbedLayout = () => {
  return (
    <div className="App">
      <main className="main-content" style={{ paddingTop: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default EmbedLayout;
