export default (role) => {
    const menus = [
      {
        title: "Dashboard",
        icon: "mdi-view-dashboard",
        route: "/"
      },
      {
        title: "ผู้ใช้",
        icon: "mdi-account",
        route: "/users",
        roles: ["admin"] // ใครที่ไม่ใช่ admin จะไม่เห็น
      },
      {
        title: "ตารางอีเว้นท์",
        icon: "mdi-calendar-blank",
        route: "/event-schedule"
      },
      {
        title: "ลงทะเบียนกิจกรรม",
        icon: "mdi-account-plus",
        route: "/event-registration"
      },
      {
        title: "ประวัติการลงทะเบียน",
        icon: "mdi-history",
        route: "/registration-history"
      },
      {
        title: "ตั้งค่า",
        icon: "mdi-cog",
        route: "/settings"
      }
    ];
  
    // ถ้า role = god → เห็นทุกอย่าง
    if (role === "god") {
      return menus;
    }
  
    // role อื่น → filter ตาม roles
    return menus.filter(item => {
      if (!item.roles) return true;        // ถ้าไม่ได้กำหนด roles → แสดงได้ทุก role
      return item.roles.includes(role);    // ถ้ามี roles → ต้องตรง
    });
  };
  