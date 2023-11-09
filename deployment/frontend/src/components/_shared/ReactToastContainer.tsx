import { ToastContainer } from "react-toastify";

export default function ReactToastContainer() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      theme="light"
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
    />
  );
}
