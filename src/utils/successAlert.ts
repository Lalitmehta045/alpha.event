"use client";

import Swal from "sweetalert2";

export const successAlert = async (title: string) => {
  return await Swal.fire({
    icon: "success",
    title,
    confirmButtonColor: "#00b050",
  });
};
