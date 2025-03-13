import Cookies from "js-cookie";

// Set division session in cookies
export const setDivisionSession = (divisionData:any) => {
  Cookies.set("divisionSession", JSON.stringify(divisionData), { expires: 1 });
};

// Get division session from cookies
export const getDivisionSession = () => {
  const data = Cookies.get("divisionSession");
  return data ? JSON.parse(data) : null;
};

// Clear division session from cookies
export const clearDivisionSession = () => {
  Cookies.remove("divisionSession");
};
