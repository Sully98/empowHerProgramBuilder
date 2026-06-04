interface ToastProps {
  msg: string;
  visible: boolean;
}

export function Toast({ msg, visible }: ToastProps) {
  return (
    <div className={`toast${visible ? ' show' : ''}`} id="toast">
      {msg}
    </div>
  );
}
