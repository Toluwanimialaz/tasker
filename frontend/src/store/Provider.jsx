import { Provider } from "react-redux";
import { Store } from "./store";
import { persistStore } from "redux-persist";

persistStore(Store);
export default function Providers({ children }) {
  return <Provider store={Store}>{children}</Provider>;
}