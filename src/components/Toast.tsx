interface ToastProps {
  message: string | null;
}

const Toast = ({ message }: ToastProps) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-black shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300">
      {message}
    </div>
  );
};

export default Toast;
