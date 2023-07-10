const imasServiceMenus = 
   [
      {
        name: "CHF",
        icon: "fa fa-users",
        isSubmenu: true,
        link: "https://chf.emgeresources.com",
      },
      {
        name: "CAP",
        icon: "fa fa-users",
        isSubmenu: true,
        link: "https://emge.emgeresources.com",
      },
      {
        name: "CASC",
        icon: "fa fa-bars",
        isSubmenu: true,
        link: "https://casc.emgeresources.com",
      }
];

function ImasServiceMenu({ role }) {
  // const roleMenus = userMenus.filter((item) => item.role === role)[0].menus;
  return (
    <div>
      {imasServiceMenus.map((menu,idx) => {
        return (
          <li className="dropdown" key={`${idx}${role}`}>
              <div>
                <a
                  className=""
                  href={menu.link}
                  id={menu.name}
                  role="button"
                  aria-expanded="false"
                >
                  <span>
                    <i className={`fa ${menu.icon} mr-2`}></i>
                  </span>
                  {menu.name}
                </a>
              </div>
          </li>
        );
      })}
    </div>
  );
}

export default ImasServiceMenu;
