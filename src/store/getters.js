import permission from "./modules/permission"

const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  currentUserId: state => state.user.id,
  permission_routes: state => state.permission.routes, // add the routes' permission
  blocks: state => state.blocks.blocks,
}
export default getters
