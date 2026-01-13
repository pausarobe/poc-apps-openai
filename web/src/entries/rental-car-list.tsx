import { createRoot } from 'react-dom/client';

function RentalCarList() {
  return <div>Rental Car List Entry Point</div>;
}

const root = createRoot(document.getElementById('root')!);
root.render(<RentalCarList />);
