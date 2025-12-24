export const fileToDataURL = async (f: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  });
};
