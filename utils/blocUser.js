const blockUser = user => {
    if (user?.isBlocked) {
      throw new Error(`Acceso Denegado el usuario ${user?.firstName} esta bloqueado,por favor contactese con el administrador`);
    }
  };
  
module.exports = blockUser;
  