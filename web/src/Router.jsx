import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { AuthRoutes } from "./AuthRoutes";
import { useAuth } from "./hooks/useAuth";
import { Oval } from "react-loader-spinner";

export function Router() {
  const { isUserLogged, isFetching } = useAuth();

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Oval
          height={40}
          width={40}
          color="#7b2cbf"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="#7b2cbf"
          strokeWidth={4}
          strokeWidthSecondary={4}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isUserLogged ? <AppRoutes /> : <AuthRoutes />}
    </BrowserRouter>
  );
}
