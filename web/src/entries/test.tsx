import { createRoot } from 'react-dom/client';

function TEST() {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        backgroundColor: '#df2222ff',
        borderRadius: '10px',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      A
    </div>
  );
}

export default function App() {
  return <TEST></TEST>;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
