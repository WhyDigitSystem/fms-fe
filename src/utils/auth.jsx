export const logout = (navigate) => {
  // Clear all auth-related items
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("screens");
  localStorage.removeItem("userName");
  localStorage.removeItem("userType");
  localStorage.removeItem("email");
  localStorage.removeItem("nickName");
  localStorage.removeItem("responseScreens");

  // Get current mobile view preference
  const isMobile = localStorage.getItem("isMobileView") === "true";

  // Redirect to login with mobile state
  navigate("/login", { state: { isMobile } });
};
