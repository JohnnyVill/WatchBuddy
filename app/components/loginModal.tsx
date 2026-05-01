import type { FormEvent } from "react";

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
};

export default function LoginModal({ visible, onClose, onLogin }: LoginModalProps) {
  if (!visible) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="username"
            placeholder="Username"
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            required
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 p-2 rounded">
            Login
          </button>
        </form>
        <button type="button" onClick={onClose} className="mt-4 text-gray-400">
          Close
        </button>
      </div>
    </div>
  );
}
