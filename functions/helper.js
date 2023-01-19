const isDevEnv = () => {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development"
  );
};

export { isDevEnv };
