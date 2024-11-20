import { useDispatch } from "react-redux";
import { pageSlice } from "./page/slice";

export default function NavBar() {
  const dispatch = useDispatch();

  return (
    <nav className="flex justify-around items-center h-[76px] bg-blue rounded text-[32px] text-white">
      <button
        className="hover:underline"
        onClick={() => {
          dispatch(pageSlice.actions.viewFeed());
        }}
      >
        Рабочий стол
      </button>
      <button
        className="hover:underline"
        onClick={() => {
          dispatch(pageSlice.actions.viewProfile({ userId: null }));
        }}
      >
        Мой профиль
      </button>
      <button
        className="hover:underline"
        onClick={() => {
          dispatch(pageSlice.actions.viewOrgStruct({ unitId: null }));
        }}
      >
        Орг. структура
      </button>
    </nav>
  );
}
