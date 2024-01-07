import { Bounce, toast } from "react-toastify";

export function successToast(message: string, theme: "light" | "dark") {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme,
    transition: Bounce,
  });
}
