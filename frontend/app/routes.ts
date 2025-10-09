import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/home", "routes/home.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/messages", "routes/messages.tsx"),
  route("/developer", "routes/developer.tsx"),
  route("/about", "routes/about.tsx"),
] satisfies RouteConfig;

