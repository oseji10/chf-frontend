import menus from "../../assets/menu.json";

const getMenuItems = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const permissions = user.permissions;
    //All users have view permissions by default.
    //This is why view is used to get the permission and display these as menu items
    const permisions_resource = permissions.filter((element) =>
      /^VIEW_/.test(element)
    );
    const userMenu = [];
    for (let item of menus) {
      if (permisions_resource.includes(`VIEW_${item.name}`)) {
        userMenu.push(item);
      }
    }
    return userMenu;
  } catch (err) {
    console.log("Error in menu resource", err);
    return [];
  }
};

export default getMenuItems;

export const canActivate = (userPermissions, requiredPermission) => userPermissions.includes(requiredPermission);

  
