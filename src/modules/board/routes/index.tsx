import type { RouteObject } from "react-router-dom";

import { BoardPage } from "../pages/board";

export const boardRoutes: RouteObject = {
  path: "b/:boardId",
  element: <BoardPage />,
};
